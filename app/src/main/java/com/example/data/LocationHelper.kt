package com.example.data

import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import android.os.Build
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.util.Locale
import kotlin.coroutines.resume

data class GeoPoint(val lat: Double, val lon: Double)

data class NearestResult(
    val listing: Listing,
    val distanceMeters: Float,
    val distanceDisplay: String
)

object LocationHelper {

    // Pre-mapped coordinates for all suburbs & regions present in the Kosher SA directory
    val PLACE_COORDINATES = mapOf(
        "Glenhazel" to GeoPoint(-26.1384, 28.1065),
        "Sea Point" to GeoPoint(-33.9189, 18.3908),
        "Fairmount" to GeoPoint(-26.1487, 28.0968),
        "Sandringham" to GeoPoint(-26.1517, 28.1084),
        "Johannesburg" to GeoPoint(-26.2041, 28.0473),
        "Cape Town" to GeoPoint(-33.9249, 18.4241),
        "Highlands North" to GeoPoint(-26.1408, 28.0838),
        "Savoy" to GeoPoint(-26.1361, 28.0775),
        "Sandton" to GeoPoint(-26.1076, 28.0567),
        "Gardens" to GeoPoint(-33.9366, 18.4111),
        "Norwood" to GeoPoint(-26.1583, 28.0768),
        "Percelia" to GeoPoint(-26.1472, 28.0883),
        "Greater Kruger" to GeoPoint(-24.0116, 31.4926),
        "Kruger" to GeoPoint(-24.0116, 31.4926),
        "Sabi Sand" to GeoPoint(-24.7700, 31.4800),
        "Thornybush" to GeoPoint(-24.4167, 31.1500),
        "Timbavati" to GeoPoint(-24.3667, 31.3333),
        "Plettenberg Bay" to GeoPoint(-34.0531, 23.3670),
        "Durban" to GeoPoint(-29.8587, 31.0218),
        "Pretoria" to GeoPoint(-25.7479, 28.2293),
        "Benmore" to GeoPoint(-26.0964, 28.0469),
        "Bramley" to GeoPoint(-26.1264, 28.0847),
        "Claremont" to GeoPoint(-33.9806, 18.4658),
        "Constantia" to GeoPoint(-34.0208, 18.4419),
        "Hout Bay" to GeoPoint(-34.0436, 18.3582),
        "Illovo" to GeoPoint(-26.1272, 28.0514),
        "Jet Park" to GeoPoint(-26.1772, 28.2389),
        "Killarney" to GeoPoint(-26.1683, 28.0506),
        "Linksfield" to GeoPoint(-26.1625, 28.1069),
        "Lyndhurst" to GeoPoint(-26.1306, 28.1097),
        "Maitland" to GeoPoint(-33.9255, 18.4897),
        "Milnerton" to GeoPoint(-33.8698, 18.4975),
        "Modimolle" to GeoPoint(-24.7000, 28.4069),
        "Montague Gardens" to GeoPoint(-33.8650, 18.5204),
        "Morningside" to GeoPoint(-26.0792, 28.0583),
        "Orange Grove" to GeoPoint(-26.1642, 28.0825),
        "Plumstead" to GeoPoint(-34.0205, 18.4727),
        "Raedene" to GeoPoint(-26.1550, 28.0861),
        "Rondebosch" to GeoPoint(-33.9664, 18.4735),
        "Senderwood" to GeoPoint(-26.1603, 28.1250),
        "Waverley" to GeoPoint(-26.1444, 28.0786),
        "Wynberg" to GeoPoint(-34.0084, 18.4660),
        "Bantry Bay" to GeoPoint(-33.9286, 18.3804),
        "Gallo Manor" to GeoPoint(-26.0711, 28.0772),
        "Moremi" to GeoPoint(-19.2333, 23.5500),
        "Forbesdale" to GeoPoint(-20.1700, 28.5800),
        "Africa" to GeoPoint(-26.2041, 28.0473)
    )

    private val geocodedCache = mutableMapOf<String, GeoPoint>()

    /**
     * Resolves the latitude/longitude for a listing.
     * Uses precise place mapping first, fallback to city or geocoder.
     */
    suspend fun getCoordinates(context: Context, listing: Listing): GeoPoint {
        geocodedCache[listing.id]?.let { return it }

        val placeKey = listing.place.trim()
        val mapped = PLACE_COORDINATES[placeKey]
        if (mapped != null) {
            geocodedCache[listing.id] = mapped
            return mapped
        }

        // Try geocoding the full address if available
        if (listing.address.isNotBlank() && listing.address != "No address listed" && listing.address != "Greater Kruger") {
            try {
                val geocoded = geocodeAddress(context, "${listing.address}, South Africa")
                if (geocoded != null) {
                    geocodedCache[listing.id] = geocoded
                    return geocoded
                }
            } catch (_: Exception) {}
        }

        // Fallback by city
        val cityCoords = when (listing.city) {
            "Johannesburg" -> GeoPoint(-26.2041, 28.0473)
            "Cape Town" -> GeoPoint(-33.9249, 18.4241)
            else -> GeoPoint(-26.2041, 28.0473)
        }
        geocodedCache[listing.id] = cityCoords
        return cityCoords
    }

    @Suppress("DEPRECATION")
    private suspend fun geocodeAddress(context: Context, query: String): GeoPoint? = withContext(Dispatchers.IO) {
        try {
            if (!Geocoder.isPresent()) return@withContext null
            val geocoder = Geocoder(context, Locale.getDefault())
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                suspendCancellableCoroutine { continuation ->
                    geocoder.getFromLocationName(query, 1) { addresses ->
                        val first = addresses.firstOrNull()
                        if (first != null) {
                            continuation.resume(GeoPoint(first.latitude, first.longitude))
                        } else {
                            continuation.resume(null)
                        }
                    }
                }
            } else {
                val addresses = geocoder.getFromLocationName(query, 1)
                addresses?.firstOrNull()?.let { GeoPoint(it.latitude, it.longitude) }
            }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Calculates the distance in meters between two coordinates using the Haversine formula.
     */
    fun calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): Float {
        val earthRadiusMeters = 6371000.0
        val lat1Rad = Math.toRadians(p1.lat)
        val lat2Rad = Math.toRadians(p2.lat)
        val dLat = Math.toRadians(p2.lat - p1.lat)
        val dLon = Math.toRadians(p2.lon - p1.lon)

        val a = Math.sin(dLat / 2).let { it * it } +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(dLon / 2).let { it * it }
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a))
        return (earthRadiusMeters * c).toFloat()
    }

    /**
     * Formats distance cleanly (e.g. "850 m away", "1.4 km away", "35 km away").
     */
    fun formatDistance(meters: Float): String {
        return when {
            meters < 50 -> "Right here (<50 m)"
            meters < 1000 -> "${Math.round(meters)} m away"
            meters < 10000 -> String.format(Locale.US, "%.1f km away", meters / 1000f)
            else -> "${Math.round(meters / 1000f)} km away"
        }
    }

    /**
     * Obtains the current device GPS location.
     */
    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(context: Context): GeoPoint? {
        return withTimeoutOrNull(7000L) {
            suspendCancellableCoroutine { continuation ->
                try {
                    val fusedClient = LocationServices.getFusedLocationProviderClient(context)
                    val cts = CancellationTokenSource()

                    fusedClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
                        .addOnSuccessListener { loc ->
                            if (loc != null) {
                                if (continuation.isActive) {
                                    continuation.resume(GeoPoint(loc.latitude, loc.longitude))
                                }
                            } else {
                                // Fallback to last known location
                                fusedClient.lastLocation.addOnSuccessListener { lastLoc ->
                                    if (continuation.isActive) {
                                        if (lastLoc != null) {
                                            continuation.resume(GeoPoint(lastLoc.latitude, lastLoc.longitude))
                                        } else {
                                            continuation.resume(fallbackLocationManager(context))
                                        }
                                    }
                                }.addOnFailureListener {
                                    if (continuation.isActive) {
                                        continuation.resume(fallbackLocationManager(context))
                                    }
                                }
                            }
                        }
                        .addOnFailureListener {
                            if (continuation.isActive) {
                                continuation.resume(fallbackLocationManager(context))
                            }
                        }

                    continuation.invokeOnCancellation {
                        cts.cancel()
                    }
                } catch (_: SecurityException) {
                    if (continuation.isActive) continuation.resume(null)
                } catch (_: Exception) {
                    if (continuation.isActive) continuation.resume(fallbackLocationManager(context))
                }
            }
        } ?: fallbackLocationManager(context)
    }

    @SuppressLint("MissingPermission")
    private fun fallbackLocationManager(context: Context): GeoPoint? {
        return try {
            val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
            val providers = lm.getProviders(true)
            var bestLocation: Location? = null
            for (provider in providers) {
                val l = lm.getLastKnownLocation(provider) ?: continue
                if (bestLocation == null || l.accuracy < bestLocation.accuracy) {
                    bestLocation = l
                }
            }
            bestLocation?.let { GeoPoint(it.latitude, it.longitude) }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Finds the top N nearest listings among candidates given a current location.
     */
    suspend fun findTopNearest(
        context: Context,
        currentLocation: GeoPoint,
        listings: List<Listing>,
        limit: Int = 5
    ): List<NearestResult> {
        if (listings.isEmpty()) return emptyList()

        return listings.map { listing ->
            val coords = getCoordinates(context, listing)
            val dist = calculateDistanceMeters(currentLocation, coords)
            NearestResult(
                listing = listing,
                distanceMeters = dist,
                distanceDisplay = formatDistance(dist)
            )
        }.sortedBy { it.distanceMeters }.take(limit)
    }

    suspend fun findNearest(
        context: Context,
        currentLocation: GeoPoint,
        listings: List<Listing>
    ): NearestResult? = findTopNearest(context, currentLocation, listings, 1).firstOrNull()
}
