package com.example

import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.components.generateStorefrontSvg
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {
    @Test
    fun testInitials() {
        assertEquals("1O", DirectoryConstants.initials("18 On The Hill"))
        assertEquals("AF", DirectoryConstants.initials("Angel Food (Jody Kruger)"))
        assertEquals("BB", DirectoryConstants.initials("Burger & Brew"))
        assertEquals("CC", DirectoryConstants.initials("The Circle Cafe"))
    }

    @Test
    fun testHueAndHash() {
        val listing = Listing(
            id = "bagel-zone-599",
            name = "Bagel Zone",
            cats = listOf("Caterer", "Restaurant")
        )
        val h = DirectoryConstants.hueOf(listing)
        assertTrue(h in 0..359)
    }

    @Test
    fun testStorefrontSvgGeneration() {
        val listing = Listing(
            id = "bagel-zone-599",
            name = "Bagel Zone",
            cats = listOf("Caterer", "Restaurant")
        )
        val svg = generateStorefrontSvg(listing)
        assertTrue(svg.startsWith("<svg"))
        assertTrue(svg.contains("BAGEL ZONE"))
        assertTrue(svg.contains("KOSHER"))
        assertTrue(svg.endsWith("</svg>"))
    }

    @Test
    fun testLocationHelperFormattingAndCalculations() {
        val p1 = com.example.data.GeoPoint(-26.1384, 28.1065) // Glenhazel
        val p2 = com.example.data.GeoPoint(-26.1487, 28.0968) // Fairmount (approx 1.5 km away)
        val dist = com.example.data.LocationHelper.calculateDistanceMeters(p1, p2)
        assertTrue(dist > 500f && dist < 3000f)

        val formattedShort = com.example.data.LocationHelper.formatDistance(450f)
        assertEquals("450 m away", formattedShort)

        val formattedKm = com.example.data.LocationHelper.formatDistance(1400f)
        assertEquals("1.4 km away", formattedKm)
    }
}
