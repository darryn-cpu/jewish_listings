package com.example.ui.screens

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import android.content.Intent
import android.net.Uri
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.example.data.GeoPoint
import com.example.data.LocationHelper
import com.example.data.NearestResult
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.District
import com.example.data.Listing
import com.example.ui.components.FeatureCard
import com.example.ui.components.KashChipsRow
import com.example.ui.components.ListingLogo
import com.example.ui.components.hslColor
import com.example.ui.theme.AppAccent
import com.example.ui.theme.AppAccent2
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentLine
import com.example.ui.theme.AppAccentSoft
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppLine2
import com.example.ui.theme.AppOk
import com.example.ui.theme.AppSurface
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.Glass2Bg
import com.example.ui.theme.GlassBg
import com.example.ui.theme.GoldGradient
import com.example.ui.theme.KosherTextGradient

@Composable
fun BrowseScreen(
    listings: List<Listing>,
    selectedCity: String,
    selectedKash: List<String>,
    savedIds: List<String>,
    browseSearchQuery: String,
    isLocating: Boolean,
    nearestResults: List<NearestResult>,
    userLocation: GeoPoint?,
    scrollState: LazyListState,
    onBrowseSearchChange: (String) -> Unit,
    onClearBrowseSearch: () -> Unit,
    onFindClosest: () -> Unit,
    onDismissNearest: () -> Unit,
    onOpenSearch: () -> Unit,
    onOpenDistrict: (districtId: String, categoryId: String) -> Unit,
    onOpenListing: (String) -> Unit,
    onToggleKash: (String) -> Unit,
    onClearKash: () -> Unit,
    onToggleSave: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val scopeLine = remember(selectedCity) {
        if (selectedCity == "All") "South Africa" else DirectoryConstants.cityLabel(selectedCity)
    }

    val isFilterOrSearchActive = browseSearchQuery.isNotBlank() || selectedCity != "All" || selectedKash.isNotEmpty()

    val distanceMap = remember(listings, userLocation) {
        if (userLocation == null) {
            emptyMap()
        } else {
            listings.associate { listing ->
                val coords = LocationHelper.PLACE_COORDINATES[listing.place.trim()]
                    ?: LocationHelper.PLACE_COORDINATES[if (listing.city == "Cape Town") "Cape Town" else "Johannesburg"]
                    ?: GeoPoint(-26.2041, 28.0473)
                val dist = LocationHelper.calculateDistanceMeters(userLocation, coords)
                listing.id to LocationHelper.formatDistance(dist)
            }
        }
    }

    val featureListings = remember(listings) {
        listings.sortedWith(
            compareByDescending<Listing> { it.line.isNotEmpty() }
                .thenByDescending { it.webs.size }
                .thenBy { it.name }
        ).take(8)
    }

    LazyColumn(
        state = scrollState,
        modifier = modifier.padding(bottom = 96.dp)
    ) {
        // Hero Section
        item {
            Column(modifier = Modifier.padding(18.dp, 12.dp, 18.dp, 6.dp)) {
                // Live count pill
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .border(1.dp, AppLine2, RoundedCornerShape(16.dp))
                        .background(GlassBg)
                        .padding(horizontal = 14.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
                    val pulseScale by infiniteTransition.animateFloat(
                        initialValue = 0.85f,
                        targetValue = 1.3f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(1100),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "scale"
                    )

                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .scale(pulseScale)
                            .background(AppOk, CircleShape)
                    )
                    Text(
                        text = "${listings.size} kosher ${if (listings.size == 1) "listing" else "listings"} · $scopeLine",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppText2
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Headline with serif italic gold gradient "kosher"
                Text(
                    text = buildAnnotatedString {
                        append("Find a ")
                        withStyle(
                            SpanStyle(
                                brush = KosherTextGradient,
                                fontStyle = FontStyle.Italic,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Normal
                            )
                        ) {
                            append("kosher")
                        }
                        append(" table, first.")
                    },
                    fontSize = 44.sp,
                    lineHeight = 44.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.055).sp
                )

                Text(
                    text = "Restaurants, bakeries, markets, caterers and lodges from the Kosher SA shopping and dining directory.",
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    color = AppText2,
                    modifier = Modifier.padding(top = 12.dp, bottom = 20.dp)
                )

                // Search bar with real-time text input
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(62.dp)
                        .shadow(12.dp, RoundedCornerShape(24.dp), spotColor = Color(0x33000000))
                        .clip(RoundedCornerShape(24.dp))
                        .border(1.dp, AppLine2, RoundedCornerShape(24.dp))
                        .background(GlassBg)
                        .padding(start = 14.dp, end = 9.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = null,
                        tint = AppAccentText,
                        modifier = Modifier.size(21.dp)
                    )
                    TextField(
                        value = browseSearchQuery,
                        onValueChange = onBrowseSearchChange,
                        placeholder = {
                            Text(
                                text = "Search bakeries, caterers, lodges…",
                                fontSize = 15.sp,
                                color = AppText3
                            )
                        },
                        singleLine = true,
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    )
                    if (browseSearchQuery.isNotEmpty()) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(Glass2Bg)
                                .clickable(onClick = onClearBrowseSearch),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Close,
                                contentDescription = "Clear search",
                                tint = AppText2,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .shadow(8.dp, RoundedCornerShape(17.dp), spotColor = Color(0x66FFA01E))
                                .background(GoldGradient, RoundedCornerShape(17.dp))
                                .clickable(onClick = onOpenSearch),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = "Search tab",
                                tint = AppAccentInk,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                // Horizontal quick district chips
                Spacer(modifier = Modifier.height(14.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DirectoryConstants.DISTRICTS.forEach { district ->
                        Row(
                            modifier = Modifier
                                .height(46.dp)
                                .clip(RoundedCornerShape(23.dp))
                            .border(1.dp, AppLine2, RoundedCornerShape(23.dp))
                            .background(GlassBg)
                            .clickable { onOpenDistrict(district.id, "all") }
                            .padding(start = 14.dp, end = 18.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(9.dp)
                        ) {
                            Text(
                                text = district.name,
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppText
                            )
                        }
                    }
                }
            }
        }

        // Kashrut Section
        item {
            Column(modifier = Modifier.padding(horizontal = 18.dp, vertical = 8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "KASHRUT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppText3,
                        letterSpacing = 0.13.sp
                    )
                    Text(
                        text = if (selectedKash.isNotEmpty()) "Match all selected" else "Any listing",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppText2
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                KashChipsRow(
                    selectedKash = selectedKash,
                    onToggleKash = onToggleKash,
                    onClearKash = onClearKash
                )
            }
        }

        // "What's closest to me..." button
        item {
            ClosestToMeButton(
                isFiltering = isFilterOrSearchActive,
                isLocating = isLocating,
                listingCount = listings.size,
                onClick = onFindClosest,
                modifier = Modifier.padding(horizontal = 18.dp, vertical = 6.dp)
            )
        }

        // Nearest Results when GPS calculation produces results (top 5 closest)
        if (nearestResults.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 6.dp)
                ) {
                    // Header with count and clear button
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "LOCATION SEARCH RESULTS",
                                fontSize = 10.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppAccentText,
                                letterSpacing = 0.16.sp
                            )
                            Text(
                                text = "Closest to you (${nearestResults.size})",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AppText,
                                letterSpacing = (-0.03).sp
                            )
                        }

                        // Dismiss / Clear button
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .border(1.dp, AppLine2, RoundedCornerShape(14.dp))
                                .background(Glass2Bg)
                                .clickable(onClick = onDismissNearest)
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Close,
                                    contentDescription = "Dismiss",
                                    tint = AppText2,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "Clear",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AppText2
                                )
                            }
                        }
                    }

                    // Top nearest places cards (up to 5)
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        nearestResults.forEachIndexed { index, result ->
                            NearestPlaceCard(
                                rank = index + 1,
                                nearestResult = result,
                                isSaved = savedIds.contains(result.listing.id),
                                onToggleSave = { onToggleSave(result.listing.id) },
                                onOpenListing = onOpenListing
                            )
                        }
                    }
                }
            }
        }

        // Feature "Step inside" rail
        item {
            Column(modifier = Modifier.padding(top = 18.dp)) {
                Column(modifier = Modifier.padding(horizontal = 18.dp)) {
                    Text(
                        text = "STOREFRONTS · $scopeLine",
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppAccentText,
                        letterSpacing = 0.16.sp
                    )
                    Text(
                        text = "Step inside",
                        fontSize = 25.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = AppText,
                        letterSpacing = (-0.04).sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 10.dp)
                    )
                }

                if (featureListings.isNotEmpty()) {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        item { Spacer(modifier = Modifier.width(18.dp)) }
                        items(featureListings, key = { it.id }) { listing ->
                            FeatureCard(
                                listing = listing,
                                isSaved = savedIds.contains(listing.id),
                                onSaveToggle = { onToggleSave(listing.id) },
                                onClick = { onOpenListing(listing.id) },
                                distanceTag = distanceMap[listing.id]
                            )
                        }
                        item { Spacer(modifier = Modifier.width(18.dp)) }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp)
                            .clip(RoundedCornerShape(28.dp))
                            .border(1.5.dp, AppLine2, RoundedCornerShape(28.dp))
                            .background(Glass2Bg)
                            .padding(32.dp, 24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(9.dp)
                        ) {
                            Text(
                                text = "No listings in this view",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppText
                            )
                            Text(
                                text = if (browseSearchQuery.isNotBlank())
                                    "No listings match “$browseSearchQuery”. Try clearing your search or switching filters."
                                else
                                    "Clear a kashrut flag or switch city to see more of the directory.",
                                fontSize = 13.5.sp,
                                color = AppText2
                            )
                        }
                    }
                }
            }
        }

        // "Shop the whole table" Directory Section
        item {
            Column(modifier = Modifier.padding(horizontal = 18.dp, vertical = 22.dp)) {
                Text(
                    text = "DIRECTORY",
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppAccentText,
                    letterSpacing = 0.16.sp
                )
                Text(
                    text = "Shop the whole table",
                    fontSize = 25.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.04).sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                )

                // Wide Tile: Restaurants & Coffee
                DistrictTileWide(
                    district = DirectoryConstants.distById("eat"),
                    allListings = listings,
                    onClick = { onOpenDistrict("eat", "all") }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Half Tiles row: Bakeries & delis, Lodges & safaris
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DistrictTileHalf(
                        district = DirectoryConstants.distById("bake"),
                        allListings = listings,
                        onClick = { onOpenDistrict("bake", "all") },
                        modifier = Modifier.weight(1f)
                    )
                    DistrictTileHalf(
                        district = DirectoryConstants.distById("travel"),
                        allListings = listings,
                        onClick = { onOpenDistrict("travel", "all") },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Mall Tiles: Markets & groceries
                DistrictMallTile(
                    district = DirectoryConstants.distById("shop"),
                    allListings = listings,
                    onOpenCategory = { catId -> onOpenDistrict("shop", catId) },
                    onOpenDistrict = { onOpenDistrict("shop", "all") }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Mall Tiles: Catering & events
                DistrictMallTile(
                    district = DirectoryConstants.distById("events"),
                    allListings = listings,
                    onOpenCategory = { catId -> onOpenDistrict("events", catId) },
                    onOpenDistrict = { onOpenDistrict("events", "all") }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Mall Tiles: On the move
                DistrictMallTile(
                    district = DirectoryConstants.distById("move"),
                    allListings = listings,
                    onOpenCategory = { catId -> onOpenDistrict("move", catId) },
                    onOpenDistrict = { onOpenDistrict("move", "all") }
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Quiet foot note
                Row(
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Security,
                        contentDescription = null,
                        tint = AppText3,
                        modifier = Modifier
                            .size(16.dp)
                            .padding(top = 2.dp)
                    )
                    Text(
                        text = "Contact details are the ones published in the directory. A kashrut flag appears only when that column was marked Yes.",
                        fontSize = 12.5.sp,
                        lineHeight = 18.sp,
                        color = AppText3
                    )
                }
            }
        }
    }
}

@Composable
fun DistrictTileWide(
    district: District,
    allListings: List<Listing>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val matching = remember(allListings) {
        allListings.filter { b -> b.cats.any { district.cats.contains(it) } }
    }
    val sampleNames = remember(matching) {
        matching.take(3).map { it.name }
    }

    val hue = district.hue
    val bgStart = remember(hue) { hslColor(hue, 88f, 58f).copy(alpha = 0.22f) }
    val bgEnd = remember(hue) { hslColor(hue, 70f, 40f).copy(alpha = 0.05f) }
    val borderCol = remember(hue) { hslColor(hue, 80f, 60f).copy(alpha = 0.35f) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .border(1.dp, borderCol, RoundedCornerShape(28.dp))
            .background(
                Brush.linearGradient(listOf(bgStart, bgEnd))
            )
            .background(AppSurface.copy(alpha = 0.75f))
            .clickable(onClick = onClick)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                // Icon
                DistrictIconBadge(hue = hue)

                Text(
                    text = district.name,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.035).sp
                )
                Text(
                    text = "${matching.size} ${if (matching.size == 1) "listing" else "listings"}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.1.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )

                // Overlapping avatar logos
                if (matching.isNotEmpty()) {
                    Row(
                        modifier = Modifier.padding(top = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box {
                            matching.take(3).forEachIndexed { idx, listing ->
                                ListingLogo(
                                    listing = listing,
                                    size = 30.dp,
                                    modifier = Modifier.padding(start = (22 * idx).dp)
                                )
                            }
                        }
                        if (matching.size > 3) {
                            Text(
                                text = "+${matching.size - 3}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AppText2,
                                modifier = Modifier.padding(start = 8.dp)
                            )
                        }
                    }
                }
            }

            // Right sample names
            Column(
                modifier = Modifier
                    .weight(0.9f)
                    .padding(start = 14.dp)
                    .border(width = 0.5.dp, color = AppLine)
                    .padding(start = 14.dp, top = 24.dp),
                verticalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                if (sampleNames.isNotEmpty()) {
                    sampleNames.forEach { name ->
                        Text(
                            text = name,
                            fontSize = 13.sp,
                            color = AppText2,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                } else {
                    Text(
                        text = "None in this view",
                        fontSize = 13.sp,
                        fontStyle = FontStyle.Italic,
                        color = AppText3
                    )
                }
            }
        }

        // Arrow top right
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(32.dp)
                .clip(CircleShape)
                .border(1.dp, AppLine, CircleShape)
                .background(Glass2Bg),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = AppText2,
                modifier = Modifier.size(15.dp)
            )
        }
    }
}

@Composable
fun DistrictTileHalf(
    district: District,
    allListings: List<Listing>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val matching = remember(allListings) {
        allListings.filter { b -> b.cats.any { district.cats.contains(it) } }
    }

    val hue = district.hue
    val bgStart = remember(hue) { hslColor(hue, 88f, 58f).copy(alpha = 0.22f) }
    val bgEnd = remember(hue) { hslColor(hue, 70f, 40f).copy(alpha = 0.05f) }
    val borderCol = remember(hue) { hslColor(hue, 80f, 60f).copy(alpha = 0.35f) }

    Box(
        modifier = modifier
            .height(182.dp)
            .clip(RoundedCornerShape(28.dp))
            .border(1.dp, borderCol, RoundedCornerShape(28.dp))
            .background(Brush.linearGradient(listOf(bgStart, bgEnd)))
            .background(AppSurface.copy(alpha = 0.75f))
            .clickable(onClick = onClick)
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                DistrictIconBadge(hue = hue)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = district.name,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.035).sp,
                    lineHeight = 21.sp
                )
                Text(
                    text = "${matching.size} ${if (matching.size == 1) "listing" else "listings"}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.1.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            if (matching.isNotEmpty()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box {
                        matching.take(3).forEachIndexed { idx, listing ->
                            ListingLogo(
                                listing = listing,
                                size = 30.dp,
                                modifier = Modifier.padding(start = (22 * idx).dp)
                            )
                        }
                    }
                    if (matching.size > 3) {
                        Text(
                            text = "+${matching.size - 3}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText2,
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(32.dp)
                .clip(CircleShape)
                .border(1.dp, AppLine, CircleShape)
                .background(Glass2Bg),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = AppText2,
                modifier = Modifier.size(15.dp)
            )
        }
    }
}

@Composable
fun DistrictMallTile(
    district: District,
    allListings: List<Listing>,
    onOpenCategory: (String) -> Unit,
    onOpenDistrict: () -> Unit,
    modifier: Modifier = Modifier
) {
    val matching = remember(allListings) {
        allListings.filter { b -> b.cats.any { district.cats.contains(it) } }
    }

    val hue = district.hue
    val borderCol = remember(hue) { hslColor(hue, 80f, 60f).copy(alpha = 0.35f) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .border(1.dp, borderCol, RoundedCornerShape(28.dp))
            .background(AppSurface)
    ) {
        // Mall head
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onOpenDistrict)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(13.dp)
        ) {
            DistrictIconBadge(hue = hue)
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = district.name,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.035).sp
                )
                Text(
                    text = "${matching.size} ${if (matching.size == 1) "listing" else "listings"}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.1.sp
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = AppText2,
                modifier = Modifier.size(18.dp)
            )
        }

        // Aisles list
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(width = 0.5.dp, color = borderCol)
        ) {
            district.cats.forEachIndexed { index, catId ->
                val catListings = allListings.filter { it.cats.contains(catId) }
                val sampleNames = catListings.take(2).map { it.name }.joinToString(" · ").ifEmpty { "None in this view" }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenCategory(catId) }
                        .padding(horizontal = 16.dp, vertical = 13.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .border(1.dp, AppLine, RoundedCornerShape(14.dp))
                            .background(Glass2Bg),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = DirectoryConstants.catName(catId).take(1),
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 16.sp,
                            color = AppText2
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = DirectoryConstants.catName(catId),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText,
                            letterSpacing = (-0.02).sp
                        )
                        Text(
                            text = "${catListings.size} · $sampleNames",
                            fontSize = 12.5.sp,
                            color = AppText3,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        tint = AppText3,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun DistrictIconBadge(hue: Int, modifier: Modifier = Modifier) {
    val col1 = remember(hue) { hslColor(hue, 95f, 66f) }
    val col2 = remember(hue) { hslColor((hue + 20) % 360, 85f, 50f) }
    val textColor = remember(hue) { hslColor(hue, 90f, 10f) }

    Box(
        modifier = modifier
            .size(48.dp)
            .shadow(10.dp, RoundedCornerShape(17.dp), spotColor = col2.copy(alpha = 0.5f))
            .background(Brush.linearGradient(listOf(col1, col2)), RoundedCornerShape(17.dp)),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Filled.Info,
            contentDescription = null,
            tint = textColor,
            modifier = Modifier.size(24.dp)
        )
    }
}

@Composable
fun ClosestToMeButton(
    isFiltering: Boolean,
    isLocating: Boolean,
    listingCount: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = if (isFiltering) AppAccentLine else AppLine2
    val bgModifier = if (isFiltering) {
        Modifier
            .shadow(10.dp, RoundedCornerShape(22.dp), spotColor = Color(0x66FFA01E))
            .background(GoldGradient, RoundedCornerShape(22.dp))
    } else {
        Modifier
            .border(1.dp, AppLine2, RoundedCornerShape(22.dp))
            .background(GlassBg, RoundedCornerShape(22.dp))
    }

    val contentColor = if (isFiltering) AppAccentInk else AppText
    val subColor = if (isFiltering) Color(0xFF4A3400) else AppText3

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .then(bgModifier)
            .clickable(enabled = !isLocating, onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(if (isFiltering) Color(0x2E000000) else AppAccentSoft),
                contentAlignment = Alignment.Center
            ) {
                if (isLocating) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(22.dp),
                        color = if (isFiltering) AppAccentInk else AppAccentText,
                        strokeWidth = 2.5.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Filled.NearMe,
                        contentDescription = "Find closest",
                        tint = if (isFiltering) AppAccentInk else AppAccentText,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = if (isLocating) "Locating nearest with GPS…" else "What's closest to me?",
                        fontSize = 15.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = contentColor,
                        letterSpacing = (-0.02).sp
                    )
                    if (isFiltering) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x33000000))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "FILTERED",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AppAccentInk,
                                letterSpacing = 0.1.sp
                            )
                        }
                    }
                }
                Text(
                    text = if (isLocating) "Reading GPS to rank results by distance…"
                    else "Calculates nearest of $listingCount ${if (listingCount == 1) "result" else "results"} using GPS",
                    fontSize = 12.sp,
                    color = subColor
                )
            }

            if (!isLocating) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = contentColor,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun NearestPlaceCard(
    rank: Int,
    nearestResult: NearestResult,
    isSaved: Boolean,
    onToggleSave: () -> Unit,
    onOpenListing: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val listing = nearestResult.listing
    val isFirst = rank == 1

    Box(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = if (isFirst) 14.dp else 6.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = if (isFirst) Color(0x55FFA01E) else Color(0x25000000)
            )
            .clip(RoundedCornerShape(24.dp))
            .border(
                width = if (isFirst) 1.5.dp else 1.dp,
                color = if (isFirst) AppAccentLine else AppLine2,
                shape = RoundedCornerShape(24.dp)
            )
            .background(AppSurface)
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Header with Rank badge & Distance + Heart Save Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Rank + Distance Badge
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isFirst) GoldGradient else Brush.horizontalGradient(listOf(Glass2Bg, Glass2Bg)))
                        .border(
                            1.dp,
                            if (isFirst) Color.Transparent else AppLine2,
                            RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = if (isFirst) Icons.Filled.NearMe else Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint = if (isFirst) AppAccentInk else AppAccentText,
                        modifier = Modifier.size(13.dp)
                    )
                    Text(
                        text = if (isFirst) {
                            "#1 CLOSEST · ${nearestResult.distanceDisplay.uppercase()}"
                        } else {
                            "#$rank · ${nearestResult.distanceDisplay.uppercase()}"
                        },
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (isFirst) AppAccentInk else AppText,
                        letterSpacing = 0.08.sp
                    )
                }

                // Heart Save Button
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .border(1.dp, if (isSaved) Color.Transparent else AppLine2, CircleShape)
                        .background(if (isSaved) AppAccent else Glass2Bg)
                        .clickable(onClick = onToggleSave),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = if (isSaved) "Remove from saved" else "Save listing",
                        tint = if (isSaved) AppAccentInk else AppText2,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Storefront info (Logo + Title + Place / Category + Address)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenListing(listing.id) },
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ListingLogo(
                    listing = listing,
                    size = 50.dp
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = listing.name,
                        fontSize = 17.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = AppText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${listing.place} · ${DirectoryConstants.catName(listing.cats.firstOrNull() ?: "")}",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppAccentText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (listing.address.isNotBlank() && listing.address != "No address listed") {
                        Text(
                            text = listing.address,
                            fontSize = 11.5.sp,
                            color = AppText3,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 1.dp)
                        )
                    }
                }
            }

            // Action buttons: "View Storefront" & "Directions"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // View Storefront
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isFirst) GoldGradient else Brush.horizontalGradient(listOf(AppAccentSoft, AppAccentSoft)))
                        .clickable { onOpenListing(listing.id) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "View Storefront",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isFirst) AppAccentInk else AppAccentText
                    )
                }

                // Directions
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .border(1.dp, AppLine2, RoundedCornerShape(14.dp))
                        .background(Glass2Bg)
                        .clickable {
                            val uri = if (listing.maps.isNotEmpty()) {
                                Uri.parse(listing.maps[0])
                            } else {
                                val q = if (listing.address.isNotBlank()) listing.address else "${listing.name} ${listing.place} South Africa"
                                Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(q)}")
                            }
                            try {
                                context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                            } catch (_: Exception) {}
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Directions,
                            contentDescription = null,
                            tint = AppText,
                            modifier = Modifier.size(15.dp)
                        )
                        Text(
                            text = "Directions",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = AppText
                        )
                    }
                }
            }
        }
    }
}
