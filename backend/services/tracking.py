from math import radians, sin, cos, sqrt, atan2


def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * atan2(sqrt(a), sqrt(1 - a))


def smooth_coordinates(coords, window=3):
    smoothed = []
    for i in range(len(coords)):
        start = max(0, i - window // 2)
        end = min(len(coords), i + window // 2 + 1)
        window_points = coords[start:end]
        avg_lat = sum(p[0] for p in window_points) / len(window_points)
        avg_lon = sum(p[1] for p in window_points) / len(window_points)
        smoothed.append((avg_lat, avg_lon))
    return smoothed


def calculate_eta(current_lat, current_lon, dest_lat, dest_lon, speed_kmh):
    if not speed_kmh or speed_kmh <= 0:
        return None
    distance = haversine(current_lat, current_lon, dest_lat, dest_lon)
    hours = distance / speed_kmh
    return round(hours * 3600)


def derive_status(speed):
    if speed is None:
        return "idle"
    speed = float(speed)
    if speed < 0.5:
        return "idle"
    if speed < 5:
        return "paused"
    return "on_route"
