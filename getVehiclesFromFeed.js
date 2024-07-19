function getVehiclesFromFeed (entities, routeId) {
    const vehicles = [];
    for (const entity of entities) {
        if (entity.vehicle) {
            if (routeId) {
                if (entity.vehicle.trip.routeId == routeId) vehicles.push(entity);
            } else {
                vehicles.push(entity);
            }
        }
    }
    return vehicles
}

module.exports = getVehiclesFromFeed;