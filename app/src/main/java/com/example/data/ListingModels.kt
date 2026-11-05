package com.example.data

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Phone(
    val disp: String = "",
    val tel: String = "",
    val label: String = "",
    val wa: Boolean = false
)

@JsonClass(generateAdapter = true)
data class Kash(
    val p: Boolean = false, // Parev
    val d: Boolean = false, // Dairy
    val c: Boolean = false, // Chalav Yisrael
    val m: Boolean = false, // Meat
    val h: Boolean = false  // Mehadrin
)

@JsonClass(generateAdapter = true)
data class Listing(
    val id: String,
    val name: String,
    val cats: List<String> = emptyList(),
    val city: String = "Other",
    val place: String = "",
    val address: String = "",
    val phones: List<Phone> = emptyList(),
    val emails: List<String> = emptyList(),
    val webs: List<String> = emptyList(),
    val maps: List<String> = emptyList(),
    val ig: String = "",
    val fb: String = "",
    val k: Kash = Kash(),
    val notes: String = "",
    val line: String = "",
    val post: String? = null,
    val i: Int = 0,
    val desc: String? = null
)

data class District(
    val id: String,
    val name: String,
    val icon: String,
    val hue: Int,
    val cats: List<String>
)

data class KashTag(
    val key: String,
    val label: String,
    val help: String
)

object DirectoryConstants {
    val CITIES = listOf("All", "Johannesburg", "Cape Town", "Other")

    fun cityLabel(city: String): String = if (city == "Other") "Further afield" else city

    val KASH_TAGS = listOf(
        KashTag("m", "Meat", "Marked meat"),
        KashTag("d", "Dairy", "Marked dairy"),
        KashTag("c", "Chalav Yisrael", "Marked chalav yisrael"),
        KashTag("p", "Parev", "Marked parev"),
        KashTag("h", "Mehadrin", "Marked mehadrin")
    )

    val CAT_NAME = mapOf(
        "Restaurant" to "Restaurants",
        "Bakery" to "Bakeries",
        "Caterer" to "Caterers",
        "Lodges-Safaris-Tours" to "Lodges & safaris",
        "Supermarket" to "Supermarkets",
        "Deli" to "Delis",
        "Take Away" to "Takeaways",
        "Butchery" to "Butcheries",
        "Coffee Shop" to "Coffee shops",
        "Function Coordinator" to "Function coordinators",
        "Fish Shop" to "Fish shops",
        "Mobile Coffee Stall" to "Mobile coffee",
        "Mobile Pizza" to "Mobile pizza",
        "Mobile Bars" to "Mobile bars",
        "Mobile ice cream bar" to "Mobile ice cream",
        "Old Age Home" to "Old age homes",
        "Abattoir" to "Abattoirs",
        "Mobile Sweet Bar" to "Mobile sweets",
        "Mobile Food Truck" to "Food trucks",
        "Mobile Braai" to "Mobile braai",
        "Crockery/Cutlery Hire" to "Crockery & cutlery",
        "Green Grocer" to "Green grocer",
        "Ice Cream shop" to "Ice cream",
        "Liquor Store" to "Liquor",
        "Hospital meals" to "Hospital meals",
        "Wedding Venues" to "Wedding venues"
    )

    fun catName(id: String): String = CAT_NAME[id] ?: id

    val DISTRICTS = listOf(
        District(
            id = "eat",
            name = "Restaurants & coffee",
            icon = "fork",
            hue = 12,
            cats = listOf("Restaurant", "Coffee Shop", "Take Away", "Ice Cream shop", "Old Age Home", "Hospital meals")
        ),
        District(
            id = "bake",
            name = "Bakeries & delis",
            icon = "cake",
            hue = 28,
            cats = listOf("Bakery", "Deli")
        ),
        District(
            id = "shop",
            name = "Markets & groceries",
            icon = "bag",
            hue = 152,
            cats = listOf("Supermarket", "Butchery", "Fish Shop", "Green Grocer", "Liquor Store", "Abattoir")
        ),
        District(
            id = "events",
            name = "Catering & events",
            icon = "sparkle",
            hue = 322,
            cats = listOf("Caterer", "Function Coordinator", "Wedding Venues", "Crockery/Cutlery Hire")
        ),
        District(
            id = "move",
            name = "On the move",
            icon = "car",
            hue = 204,
            cats = listOf("Mobile Coffee Stall", "Mobile Pizza", "Mobile Bars", "Mobile ice cream bar", "Mobile Sweet Bar", "Mobile Food Truck", "Mobile Braai")
        ),
        District(
            id = "travel",
            name = "Lodges & safaris",
            icon = "sun",
            hue = 36,
            cats = listOf("Lodges-Safaris-Tours")
        )
    )

    fun distById(id: String): District = DISTRICTS.firstOrNull { it.id == id } ?: DISTRICTS[0]

    fun distOfCat(cat: String): District? = DISTRICTS.firstOrNull { it.cats.contains(cat) }

    val GLYPH = mapOf(
        "Restaurant" to "fork",
        "Coffee Shop" to "fork",
        "Take Away" to "bag",
        "Ice Cream shop" to "cake",
        "Old Age Home" to "home",
        "Hospital meals" to "medical",
        "Bakery" to "cake",
        "Deli" to "fork",
        "Supermarket" to "bag",
        "Butchery" to "bag",
        "Fish Shop" to "bag",
        "Green Grocer" to "flower",
        "Liquor Store" to "bag",
        "Abattoir" to "bag",
        "Caterer" to "sparkle",
        "Function Coordinator" to "calendar",
        "Wedding Venues" to "sparkle",
        "Crockery/Cutlery Hire" to "gift",
        "Mobile Coffee Stall" to "fork",
        "Mobile Pizza" to "fork",
        "Mobile Bars" to "fork",
        "Mobile ice cream bar" to "cake",
        "Mobile Sweet Bar" to "cake",
        "Mobile Food Truck" to "car",
        "Mobile Braai" to "fork",
        "Lodges-Safaris-Tours" to "sun"
    )

    val CAT_HUE = mapOf(
        "Restaurant" to 12,
        "Coffee Shop" to 28,
        "Take Away" to 18,
        "Ice Cream shop" to 330,
        "Old Age Home" to 170,
        "Hospital meals" to 188,
        "Bakery" to 32,
        "Deli" to 42,
        "Supermarket" to 152,
        "Butchery" to 356,
        "Fish Shop" to 200,
        "Green Grocer" to 145,
        "Liquor Store" to 280,
        "Abattoir" to 8,
        "Caterer" to 322,
        "Function Coordinator" to 300,
        "Wedding Venues" to 340,
        "Crockery/Cutlery Hire" to 210,
        "Mobile Coffee Stall" to 36,
        "Mobile Pizza" to 16,
        "Mobile Bars" to 48,
        "Mobile ice cream bar" to 330,
        "Mobile Sweet Bar" to 310,
        "Mobile Food Truck" to 204,
        "Mobile Braai" to 24,
        "Lodges-Safaris-Tours" to 36
    )

    fun hash(s: String): Long {
        var h = 0L
        for (ch in s) {
            h = (h * 31L + ch.code.toLong()) and 0xFFFFFFFFL
        }
        return h
    }

    fun initials(name: String): String {
        val stopWords = setOf("dr", "the", "and", "of", "co", "co.")
        val words = name.replace("&", " ")
            .split("\\s+".toRegex())
            .filter { it.isNotEmpty() && !stopWords.contains(it.lowercase()) }
        return words.take(2).map { it.first().uppercaseChar() }.joinToString("")
    }

    fun hueOf(b: Listing): Int {
        val firstCat = b.cats.firstOrNull() ?: ""
        val baseHue = CAT_HUE[firstCat] ?: 36
        val hMod = (hash(b.name) % 25L).toInt() - 12
        return ((baseHue + hMod + 360) % 360)
    }

    fun storyOf(b: Listing): String {
        val note = if (b.line.isNotEmpty() && b.line.length <= 90) b.line else ""
        if (!b.desc.isNullOrEmpty() && note.isNotEmpty()) return "${b.desc} · $note"
        if (!b.desc.isNullOrEmpty()) return b.desc
        if (b.line.isNotEmpty()) return b.line
        val cats = b.cats.map { catName(it) }.joinToString(" · ")
        return "$cats · ${b.place}"
    }

    fun metaOf(b: Listing): String {
        val cats = b.cats.take(2).map { catName(it) }.joinToString(" · ")
        val more = if (b.cats.size > 2) " +${b.cats.size - 2}" else ""
        return "$cats$more · ${b.place}"
    }

    fun hslToRgbHex(hue: Int, satPct: Float, lightPct: Float): String {
        val h = (((hue % 360) + 360) % 360).toFloat()
        val s = (satPct / 100f).coerceIn(0f, 1f)
        val l = (lightPct / 100f).coerceIn(0f, 1f)

        val c = (1f - kotlin.math.abs(2f * l - 1f)) * s
        val x = c * (1f - kotlin.math.abs((h / 60f) % 2f - 1f))
        val m = l - c / 2f

        val (rPrime, gPrime, bPrime) = when {
            h < 60f -> Triple(c, x, 0f)
            h < 120f -> Triple(x, c, 0f)
            h < 180f -> Triple(0f, c, x)
            h < 240f -> Triple(0f, x, c)
            h < 300f -> Triple(x, 0f, c)
            else -> Triple(c, 0f, x)
        }

        val r = kotlin.math.round((rPrime + m) * 255f).toInt().coerceIn(0, 255)
        val g = kotlin.math.round((gPrime + m) * 255f).toInt().coerceIn(0, 255)
        val b = kotlin.math.round((bPrime + m) * 255f).toInt().coerceIn(0, 255)

        return String.format(java.util.Locale.US, "#%02X%02X%02X", r, g, b)
    }
}

