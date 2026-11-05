package com.example.ui.components

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.ImageLoader
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.theme.GoldGradient
import java.util.Locale
import kotlin.math.max
import kotlin.math.min

object StorefrontImageLoader {
    @Volatile
    private var instance: ImageLoader? = null

    fun get(context: Context): ImageLoader {
        return instance ?: synchronized(this) {
            instance ?: ImageLoader.Builder(context.applicationContext)
                .components { add(SvgDecoder.Factory()) }
                .build().also { instance = it }
        }
    }
}

fun hslHex(h: Int, s: Float, l: Float): String = DirectoryConstants.hslToRgbHex(h, s, l)

fun hslColor(hue: Int, satPct: Float, lightPct: Float): Color {
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

    return Color(
        red = (rPrime + m).coerceIn(0f, 1f),
        green = (gPrime + m).coerceIn(0f, 1f),
        blue = (bPrime + m).coerceIn(0f, 1f)
    )
}


fun getGlyphPath(type: String): String = when (type) {
    "fork" -> """<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-3 5-3 8h3"/>"""
    "cake" -> """<path d="M4.5 20h15v-6.5a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2V20z"/><path d="M12 11.5v-3"/><path d="M12 8.5c-1.2-1.2-1.2-2.3 0-3.5 1.2 1.2 1.2 2.3 0 3.5z"/><path d="M4.5 16c2 1.5 3.5 1.5 5 0s3-1.5 5 0 3 1.5 5 0"/>"""
    "bag" -> """<path d="M5 8h14l-1 12.5H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>"""
    "home" -> """<path d="M3 11l9-7.5 9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/>"""
    "medical" -> """<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9"/>"""
    "sparkle" -> """<path d="M11 3.5l1.9 5.6 5.6 1.9-5.6 1.9L11 18.5l-1.9-5.6L3.5 11l5.6-1.9L11 3.5z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/>"""
    "flower" -> """<circle cx="12" cy="6.5" r="2.5"/><circle cx="12" cy="13.5" r="2.5"/><circle cx="8.5" cy="10" r="2.5"/><circle cx="15.5" cy="10" r="2.5"/><circle cx="12" cy="10" r="1"/><path d="M12 16v5"/>"""
    "calendar" -> """<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>"""
    "gift" -> """<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20"/><path d="M12 8.5C10.5 5 7 4.5 7 7c0 1.5 2.5 1.5 5 1.5zM12 8.5C13.5 5 17 4.5 17 7c0 1.5-2.5 1.5-5 1.5z"/>"""
    "car" -> """<path d="M4 17v-5l2.2-5.5h11.6L20 12v5"/><path d="M3 12h18"/><circle cx="7.5" cy="14.8" r="1.2"/><circle cx="16.5" cy="14.8" r="1.2"/><path d="M5 17v2.5M19 17v2.5"/>"""
    "sun" -> """<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>"""
    else -> """<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>"""
}

fun generateStorefrontSvg(listing: Listing): String {
    val h = DirectoryConstants.hueOf(listing)
    var nm = listing.name.replace("\\s*\\([^)]*\\)".toRegex(), "").trim().uppercase()
    if (nm.length > 26) {
        nm = nm.substring(0, 24) + "…"
    }
    val fs = max(8.5, min(15.0, 232.0 / (nm.length * 0.66)))
    val tl = min(232.0, nm.length * fs * 0.66)
    val w = 276.0 / 14.0
    val r = String.format(Locale.US, "%.2f", w / 2.0)
    val v = (DirectoryConstants.hash(listing.id) % 3L).toInt()

    val awn = StringBuilder()
    for (i in 0 until 14) {
        val fillHex = if (i % 2 != 0) hslHex(h, 35f, 96f) else hslHex(h, 88f, 56f)
        val x = String.format(Locale.US, "%.1f", 22.0 + i * w)
        val wStr = String.format(Locale.US, "%.1f", w)
        awn.append("""<path fill="$fillHex" d="M${x} 77h${wStr}v15a$r $r 0 0 1 -${wStr} 0z"/>""")
    }

    val bulbs = StringBuilder()
    for (i in 0 until 11) {
        val t = (i + 0.5) / 11.0
        val cx = String.format(Locale.US, "%.1f", 26.0 + 268.0 * t)
        val cy = String.format(Locale.US, "%.1f", 17.0 + 56.0 * t * (1.0 - t))
        bulbs.append("""<circle fill="#ffe9a0" cx="$cx" cy="$cy" r="2.4"/>""")
    }

    val shelf = when (v) {
        0 -> """<rect fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" x="206" y="130" width="15" height="20" rx="3"/><rect fill="${hslHex((h + 32) % 360, 92f, 82f)}" fill-opacity="0.45" x="231" y="122" width="17" height="28" rx="3"/><rect fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" x="258" y="134" width="16" height="16" rx="3"/><rect fill="${hslHex(h, 40f, 80f)}" fill-opacity="0.5" x="202" y="150" width="76" height="3" rx="1.5"/>"""
        1 -> """<circle fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" cx="218" cy="141" r="9"/><circle fill="${hslHex((h + 32) % 360, 92f, 82f)}" fill-opacity="0.45" cx="242" cy="137" r="13"/><circle fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" cx="266" cy="142" r="8"/><rect fill="${hslHex(h, 40f, 80f)}" fill-opacity="0.5" x="202" y="150" width="76" height="3" rx="1.5"/>"""
        else -> """<path fill="none" stroke="${hslHex(h, 60f, 85f)}" stroke-opacity="0.6" stroke-width="1" d="M216 109v16M242 109v9M268 109v18"/><path fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" d="M207 136a9 9 0 0 1 18 0z" transform="translate(0 -11)"/><path fill="${hslHex((h + 32) % 360, 92f, 82f)}" fill-opacity="0.45" d="M231 128a11 11 0 0 1 22 0z" transform="translate(0 -10)"/><path fill="${hslHex(h, 92f, 74f)}" fill-opacity="0.62" d="M259 138a9 9 0 0 1 18 0z" transform="translate(0 -11)"/><rect fill="${hslHex(h, 40f, 80f)}" fill-opacity="0.5" x="204" y="152" width="72" height="3" rx="1.5"/>"""
    }

    val firstCat = listing.cats.firstOrNull() ?: ""
    val glyphType = DirectoryConstants.GLYPH[firstCat] ?: "store"
    val glyphPath = getGlyphPath(glyphType)
    val glyphStroke = hslHex(h, 100f, 90f)

    val fsStr = String.format(Locale.US, "%.1f", fs)
    val tlStr = String.format(Locale.US, "%.0f", tl)
    val escapedName = nm.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    val gradStart = hslHex((h + 18) % 360, 78f, 58f)
    val gradMid = hslHex(h, 70f, 38f)
    val gradEnd = hslHex((h - 10 + 360) % 360, 60f, 15f)

    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustrated storefront: $escapedName">
<defs>
  <linearGradient id="sf_bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="$gradStart"/>
    <stop offset="52%" stop-color="$gradMid"/>
    <stop offset="100%" stop-color="$gradEnd"/>
  </linearGradient>
</defs>
<rect width="320" height="200" fill="url(#sf_bg)"/>
<g fill="#fff" opacity="0.55"><circle cx="14" cy="10" r="1"/><circle cx="52" cy="22" r="0.8"/><circle cx="96" cy="8" r="1.1"/><circle cx="214" cy="9" r="0.9"/><circle cx="262" cy="26" r="1"/><circle cx="306" cy="8" r="0.8"/></g>
<rect fill="${hslHex(h, 50f, 14f)}" fill-opacity="0.55" x="-6" y="88" width="34" height="100"/><rect fill="${hslHex(h, 50f, 14f)}" fill-opacity="0.55" x="294" y="66" width="34" height="122"/>
<path fill="none" stroke="${hslHex(h, 40f, 10f)}" stroke-opacity="0.7" stroke-width="0.9" d="M26 17Q160 45 294 17"/>$bulbs
<rect fill="${hslHex(h, 45f, 8f)}" x="0" y="178" width="320" height="22"/>
<rect fill="${hslHex(h, 38f, 16f)}" x="22" y="34" width="276" height="146" rx="8"/>
<rect fill="${hslHex(h, 50f, 9f)}" x="34" y="42" width="252" height="28" rx="8"/>
<rect fill="none" stroke="${hslHex(h, 95f, 72f)}" stroke-opacity="0.75" stroke-width="1" x="36.5" y="44.5" width="247" height="23" rx="6"/>
<text x="160" y="61" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="$fsStr" textLength="$tlStr" lengthAdjust="spacingAndGlyphs" fill="${hslHex(h, 100f, 90f)}" letter-spacing="0.02em">$escapedName</text>
<rect fill="${hslHex(h, 45f, 10f)}" x="18" y="72" width="284" height="5" rx="2.5"/>$awn
<rect fill="#000" opacity="0.24" x="22" y="93" width="276" height="10"/>
<rect fill="${hslHex(h, 35f, 30f)}" x="30" y="168" width="100" height="5" rx="2.5"/><rect fill="${hslHex(h, 35f, 30f)}" x="190" y="168" width="100" height="5" rx="2.5"/>
<rect fill="${hslHex(46, 100f, 72f)}" fill-opacity="0.2" stroke="${hslHex(h, 90f, 82f)}" stroke-opacity="0.55" stroke-width="1.2" x="36" y="108" width="88" height="60" rx="8"/>
<circle fill="${hslHex(46, 100f, 70f)}" fill-opacity="0.2" cx="80" cy="138" r="27"/>
<g transform="translate(68, 126) scale(1.0)" fill="none" stroke="$glyphStroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">$glyphPath</g>
<path fill="#fff" opacity="0.12" d="M44 160L70 108h14L58 160z"/>
<rect fill="${hslHex(46, 100f, 72f)}" fill-opacity="0.2" stroke="${hslHex(h, 90f, 82f)}" stroke-opacity="0.55" stroke-width="1.2" x="196" y="108" width="88" height="60" rx="8"/>
$shelf
<path fill="#fff" opacity="0.12" d="M204 160L230 108h14L218 160z"/>
<rect fill="${hslHex(h, 55f, 28f)}" x="136" y="104" width="48" height="76" rx="7"/>
<rect fill="${hslHex(46, 100f, 72f)}" fill-opacity="0.2" x="142" y="110" width="36" height="38" rx="5"/>
<rect fill="${hslHex(h, 100f, 78f)}" x="149" y="122" width="22" height="10" rx="3"/>
<text x="160" y="129.1" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="4.6" fill="${hslHex(h, 80f, 12f)}" letter-spacing="0.04em">KOSHER</text>
<circle fill="${hslHex(46, 100f, 70f)}" cx="177" cy="152" r="2.4"/>
<rect fill="${hslHex(46, 90f, 62f)}" x="185.5" y="128" width="3.2" height="11" rx="1.4" transform="rotate(10 187 133)"/>
<rect fill="${hslHex(h, 55f, 38f)}" x="8" y="166" width="11" height="14" rx="3"/><circle fill="${hslHex(145, 45f, 34f)}" cx="13.5" cy="158" r="8.5"/>
<rect fill="${hslHex(h, 55f, 38f)}" x="301" y="166" width="11" height="14" rx="3"/><circle fill="${hslHex(145, 45f, 34f)}" cx="306.5" cy="158" r="8.5"/>
</svg>"""
}

@Composable
fun StorefrontImage(
    listing: Listing,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    val context = LocalContext.current
    val imageLoader = remember(context.applicationContext) {
        StorefrontImageLoader.get(context.applicationContext)
    }
    val svgBytes = remember(listing.id, listing.name) {
        generateStorefrontSvg(listing).toByteArray(Charsets.UTF_8)
    }
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data(svgBytes)
            .build(),
        imageLoader = imageLoader,
        contentDescription = "Illustrated storefront: ${listing.name}",
        contentScale = contentScale,
        modifier = modifier
    )
}

@Composable
fun ListingLogo(
    listing: Listing,
    size: Dp = 60.dp,
    modifier: Modifier = Modifier
) {
    val h = remember(listing.id, listing.name) { DirectoryConstants.hueOf(listing) }
    val inits = remember(listing.name) { DirectoryConstants.initials(listing.name).ifEmpty { "•" } }
    val color1 = remember(h) { hslColor(h, 88f, 60f) }
    val color2 = remember(h) { hslColor((h + 26) % 360, 75f, 34f) }

    val cornerRadius = size * 0.32f
    Box(
        modifier = modifier
            .size(size)
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(cornerRadius),
                ambientColor = Color(0x66000000),
                spotColor = Color(0x66000000)
            )
            .border(2.5.dp, Color.White, RoundedCornerShape(cornerRadius))
            .background(
                brush = Brush.linearGradient(listOf(color1, color2)),
                shape = RoundedCornerShape(cornerRadius)
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = inits,
            color = Color.White,
            fontWeight = FontWeight.ExtraBold,
            fontSize = (size.value * 0.33f).sp,
            lineHeight = (size.value * 0.33f).sp
        )
    }
}

@Composable
fun StoreMark(size: Dp = 32.dp, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(size)
            .shadow(4.dp, RoundedCornerShape(10.dp), spotColor = Color(0x59FFA01E))
            .background(GoldGradient, RoundedCornerShape(10.dp)),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Filled.Storefront,
            contentDescription = null,
            tint = Color(0xFF1D1500),
            modifier = Modifier.size(size * 0.62f)
        )
    }
}
