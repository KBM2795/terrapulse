import json
from uuid import UUID

from geoalchemy2.elements import WKTElement
from sqlalchemy import text
from sqlalchemy.orm import Session


def geojson_to_wkt(geojson: dict) -> str:
    """Convert a GeoJSON Polygon to a WKT string.

    Handles both simple and multi-ring polygons.
    """
    coords = geojson.get("coordinates", [])
    rings = []
    for ring in coords:
        points = ", ".join(f"{coord[0]} {coord[1]}" for coord in ring)
        rings.append(f"({points})")
    return f"POLYGON({', '.join(rings)})"


def geojson_to_wkb_element(geojson: dict) -> WKTElement:
    """Convert a GeoJSON Polygon dict to a GeoAlchemy2 WKTElement for insertion."""
    wkt = geojson_to_wkt(geojson)
    return WKTElement(wkt, srid=4326)


def calculate_area_hectares(db: Session, site_id: UUID) -> float:
    """Calculate polygon area in hectares using PostGIS ST_Area with geography cast."""
    result = db.execute(
        text(
            "SELECT ST_Area(geometry::geography) / 10000.0 "
            "FROM sites WHERE id = :site_id"
        ),
        {"site_id": str(site_id)},
    ).scalar()
    return round(result, 4) if result else 0.0


def get_geometry_geojson(db: Session, site_id: UUID) -> dict | None:
    """Retrieve a site's geometry as a GeoJSON dict using PostGIS ST_AsGeoJSON."""
    result = db.execute(
        text("SELECT ST_AsGeoJSON(geometry) FROM sites WHERE id = :site_id"),
        {"site_id": str(site_id)},
    ).scalar()
    if result:
        return json.loads(result)
    return None
