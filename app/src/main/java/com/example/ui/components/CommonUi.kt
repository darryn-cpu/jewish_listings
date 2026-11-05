package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.theme.AppAccent
import com.example.ui.theme.AppAccentLine
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentSoft
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppBg
import com.example.ui.theme.AppErr
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppLine2
import com.example.ui.theme.AppOk
import com.example.ui.theme.AppSurface
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.Aur1
import com.example.ui.theme.Aur2
import com.example.ui.theme.Aur3
import com.example.ui.theme.CYBg
import com.example.ui.theme.CYText
import com.example.ui.theme.DairyBg
import com.example.ui.theme.DairyText
import com.example.ui.theme.Glass2Bg
import com.example.ui.theme.GlassBg
import com.example.ui.theme.GoldGradient
import com.example.ui.theme.MeatBg
import com.example.ui.theme.MeatText
import com.example.ui.theme.MehadrinText
import com.example.ui.theme.ParevBg
import com.example.ui.theme.ParevText

@Composable
fun AuroraBackground(modifier: Modifier = Modifier) {
    androidx.compose.foundation.Canvas(
        modifier = modifier
            .fillMaxSize()
            .background(AppBg)
    ) {
        val w = size.width
        val h = size.height

        // Blob 1: Top-Left (Aur1)
        drawCircle(
            brush = androidx.compose.ui.graphics.Brush.radialGradient(
                colors = listOf(Aur1, Color.Transparent),
                center = androidx.compose.ui.geometry.Offset(w * 0.22f, h * 0.16f),
                radius = w * 0.55f
            ),
            center = androidx.compose.ui.geometry.Offset(w * 0.22f, h * 0.16f),
            radius = w * 0.55f
        )

        // Blob 2: Top-Right (Aur2)
        drawCircle(
            brush = androidx.compose.ui.graphics.Brush.radialGradient(
                colors = listOf(Aur2, Color.Transparent),
                center = androidx.compose.ui.geometry.Offset(w * 0.82f, h * 0.12f),
                radius = w * 0.48f
            ),
            center = androidx.compose.ui.geometry.Offset(w * 0.82f, h * 0.12f),
            radius = w * 0.48f
        )

        // Blob 3: Center-Right (Aur3)
        drawCircle(
            brush = androidx.compose.ui.graphics.Brush.radialGradient(
                colors = listOf(Aur3, Color.Transparent),
                center = androidx.compose.ui.geometry.Offset(w * 0.65f, h * 0.38f),
                radius = w * 0.58f
            ),
            center = androidx.compose.ui.geometry.Offset(w * 0.65f, h * 0.38f),
            radius = w * 0.58f
        )
    }
}


@Composable
fun AppHeader(
    canGoBack: Boolean,
    title: String,
    subtitle: String,
    showCityFilter: Boolean,
    selectedCity: String,
    onBack: () -> Unit,
    onCitySelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 6.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            if (!canGoBack) {
                // Root brand
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(9.dp)
                ) {
                    StoreMark(size = 32.dp)
                    Column {
                        Text(
                            text = buildAnnotatedString {
                                append("Jewish ")
                                withStyle(SpanStyle(color = AppAccentText, fontWeight = FontWeight.ExtraBold)) {
                                    append("Yellow")
                                }
                                append(" Pages")
                            },
                            fontSize = 16.5.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText,
                            letterSpacing = (-0.035).sp,
                            fontFamily = FontFamily.SansSerif
                        )
                        Text(
                            text = "SHOPPING & DINING",
                            fontSize = 8.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = AppText3,
                            letterSpacing = 0.2.sp
                        )
                    }
                }
            } else {
                // Pushed screen title with back button
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .border(1.dp, AppLine2, CircleShape)
                            .background(Glass2Bg)
                            .clickable(onClick = onBack),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                            contentDescription = "Back",
                            tint = AppText,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = title,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            letterSpacing = (-0.035).sp
                        )
                        if (subtitle.isNotEmpty()) {
                            Text(
                                text = subtitle,
                                fontSize = 11.5.sp,
                                color = AppText3,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }

        if (showCityFilter) {
            Spacer(modifier = Modifier.height(8.dp))
            CitySelectorGrid(
                selectedCity = selectedCity,
                onCitySelected = onCitySelected
            )
        }
    }
}

@Composable
fun CitySelectorGrid(
    selectedCity: String,
    onCitySelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .border(1.dp, AppLine, RoundedCornerShape(18.dp))
            .background(Glass2Bg)
            .padding(3.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                CityButton(
                    city = "All",
                    isSelected = selectedCity == "All",
                    onClick = { onCitySelected("All") },
                    modifier = Modifier.weight(1f)
                )
                CityButton(
                    city = "Johannesburg",
                    isSelected = selectedCity == "Johannesburg",
                    onClick = { onCitySelected("Johannesburg") },
                    modifier = Modifier.weight(1f)
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                CityButton(
                    city = "Cape Town",
                    isSelected = selectedCity == "Cape Town",
                    onClick = { onCitySelected("Cape Town") },
                    modifier = Modifier.weight(1f)
                )
                CityButton(
                    city = "Other",
                    isSelected = selectedCity == "Other",
                    onClick = { onCitySelected("Other") },
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun CityButton(
    city: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bgModifier = if (isSelected) {
        Modifier
            .shadow(6.dp, RoundedCornerShape(15.dp), spotColor = Color(0x66FFA01E))
            .background(GoldGradient, RoundedCornerShape(15.dp))
    } else {
        Modifier
    }

    Box(
        modifier = modifier
            .height(36.dp)
            .clip(RoundedCornerShape(15.dp))
            .then(bgModifier)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Filled.LocationOn,
                contentDescription = null,
                tint = if (isSelected) AppAccentInk else AppText2,
                modifier = Modifier.size(13.dp)
            )
            Text(
                text = city,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) AppAccentInk else AppText2
            )
        }
    }
}

@Composable
fun KashChipsRow(
    selectedKash: List<String>,
    onToggleKash: (String) -> Unit,
    onClearKash: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        DirectoryConstants.KASH_TAGS.forEach { tag ->
            val isSelected = selectedKash.contains(tag.key)
            val chipBg = if (isSelected) {
                Modifier.background(GoldGradient, CircleShape)
            } else {
                Modifier
                    .border(1.dp, AppLine2, CircleShape)
                    .background(Glass2Bg, CircleShape)
            }

            Row(
                modifier = Modifier
                    .height(38.dp)
                    .clip(CircleShape)
                    .then(chipBg)
                    .clickable { onToggleKash(tag.key) }
                    .padding(horizontal = 15.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (isSelected) {
                    Icon(
                        imageVector = Icons.Filled.Check,
                        contentDescription = null,
                        tint = AppAccentInk,
                        modifier = Modifier.size(13.dp)
                    )
                }
                Text(
                    text = tag.label,
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isSelected) AppAccentInk else AppText
                )
            }
        }

        if (selectedKash.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .height(38.dp)
                    .clip(CircleShape)
                    .border(1.dp, AppLine2, CircleShape)
                    .background(Glass2Bg, CircleShape)
                    .clickable(onClick = onClearKash)
                    .padding(horizontal = 15.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Clear",
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AppText
                )
            }
        }
    }
}

@Composable
fun KashTagBadge(key: String, label: String, modifier: Modifier = Modifier) {
    val (bg, textColor) = when (key) {
        "m" -> MeatBg to MeatText
        "d" -> DairyBg to DairyText
        "c" -> CYBg to CYText
        "p" -> ParevBg to ParevText
        "h" -> Color.Transparent to MehadrinText
        else -> Glass2Bg to AppText2
    }

    val mod = if (key == "h") {
        modifier
            .background(GoldGradient, RoundedCornerShape(12.dp))
            .padding(horizontal = 9.dp, vertical = 3.dp)
    } else {
        modifier
            .background(bg, RoundedCornerShape(12.dp))
            .padding(horizontal = 9.dp, vertical = 3.dp)
    }

    Text(
        text = label,
        color = textColor,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        modifier = mod
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun KashFlagsRow(listing: Listing, modifier: Modifier = Modifier) {
    val activeFlags = DirectoryConstants.KASH_TAGS.filter { tag ->
        when (tag.key) {
            "m" -> listing.k.m
            "d" -> listing.k.d
            "c" -> listing.k.c
            "p" -> listing.k.p
            "h" -> listing.k.h
            else -> false
        }
    }
    if (activeFlags.isEmpty()) return

    FlowRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        activeFlags.forEach { tag ->
            KashTagBadge(key = tag.key, label = tag.label)
        }
    }
}

@Composable
fun StoreCard(
    listing: Listing,
    isSaved: Boolean,
    onSaveToggle: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .border(1.dp, AppLine, RoundedCornerShape(28.dp))
            .background(AppSurface)
            .clickable(onClick = onClick)
    ) {
        Column {
            // Art header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(8f / 5f)
            ) {
                StorefrontImage(
                    listing = listing,
                    modifier = Modifier.fillMaxSize()
                )

                // Mehadrin badge
                if (listing.k.h) {
                    Row(
                        modifier = Modifier
                            .padding(12.dp)
                            .align(Alignment.TopStart)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0x80080914))
                            .border(1.dp, Color(0x38FFFFFF), RoundedCornerShape(14.dp))
                            .padding(horizontal = 11.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Star,
                            contentDescription = null,
                            tint = Color(0xFFFFE9A0),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = "Mehadrin",
                            color = Color(0xFFFFE9A0),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                // Heart save button
                Box(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopEnd)
                        .size(42.dp)
                        .clip(CircleShape)
                        .border(
                            1.dp,
                            if (isSaved) Color.Transparent else Color(0x47FFFFFF),
                            CircleShape
                        )
                        .then(if (isSaved) Modifier.background(GoldGradient) else Modifier.background(Color(0x73080914)))
                        .clickable(onClick = onSaveToggle)
                        .semantics {
                            role = Role.Button
                            contentDescription = if (isSaved) "Remove from saved ${listing.name}" else "Save ${listing.name}"
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isSaved) AppAccentInk else Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Logo overlay
                ListingLogo(
                    listing = listing,
                    size = 46.dp,
                    modifier = Modifier
                        .padding(start = 14.dp, bottom = 12.dp)
                        .align(Alignment.BottomStart)
                )
            }

            // Body
            Column(modifier = Modifier.padding(15.dp, 17.dp, 17.dp, 17.dp)) {
                Text(
                    text = listing.name,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.035).sp,
                    lineHeight = 22.sp
                )
                Text(
                    text = DirectoryConstants.metaOf(listing),
                    fontSize = 12.5.sp,
                    color = AppText3,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Text(
                    text = DirectoryConstants.storyOf(listing),
                    fontSize = 14.sp,
                    color = AppText2,
                    lineHeight = 20.sp,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 10.dp, bottom = 11.dp)
                )

                // Foot
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                        .border(width = 0.5.dp, color = AppLine)
                        .padding(top = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp),
                            modifier = Modifier
                                .border(1.dp, AppAccentLine, RoundedCornerShape(13.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Star,
                                contentDescription = null,
                                tint = AppAccentText,
                                modifier = Modifier.size(11.dp)
                            )
                            Text(
                                text = "Kosher listing",
                                color = AppAccentText,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        }

                        KashFlagsRow(listing = listing)
                    }
                }
            }
        }
    }
}

@Composable
fun FeatureCard(
    listing: Listing,
    isSaved: Boolean,
    onSaveToggle: () -> Unit,
    onClick: () -> Unit,
    distanceTag: String? = null,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .width(278.dp)
            .clip(RoundedCornerShape(30.dp))
            .border(1.dp, AppLine, RoundedCornerShape(30.dp))
            .background(AppSurface)
            .clickable(onClick = onClick)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(3f / 2f)
            ) {
                StorefrontImage(
                    listing = listing,
                    modifier = Modifier.fillMaxSize()
                )

                if (listing.k.h) {
                    Row(
                        modifier = Modifier
                            .padding(12.dp)
                            .align(Alignment.TopStart)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0x80080914))
                            .border(1.dp, Color(0x38FFFFFF), RoundedCornerShape(14.dp))
                            .padding(horizontal = 11.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Star,
                            contentDescription = null,
                            tint = Color(0xFFFFE9A0),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = "Mehadrin",
                            color = Color(0xFFFFE9A0),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopEnd)
                        .size(42.dp)
                        .clip(CircleShape)
                        .border(1.dp, if (isSaved) Color.Transparent else Color(0x47FFFFFF), CircleShape)
                        .then(if (isSaved) Modifier.background(GoldGradient) else Modifier.background(Color(0x73080914)))
                        .clickable(onClick = onSaveToggle),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = if (isSaved) "Remove from saved" else "Save",
                        tint = if (isSaved) AppAccentInk else Color.White,
                        modifier = Modifier.size(19.dp)
                    )
                }

                ListingLogo(
                    listing = listing,
                    size = 46.dp,
                    modifier = Modifier
                        .padding(start = 14.dp, bottom = 12.dp)
                        .align(Alignment.BottomStart)
                )
            }

            Column(modifier = Modifier.padding(14.dp, 16.dp, 15.dp, 16.dp)) {
                Text(
                    text = listing.name,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = DirectoryConstants.metaOf(listing),
                    fontSize = 12.5.sp,
                    color = AppText3,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 11.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    KashFlagsRow(listing = listing)
                    Text(
                        text = if (distanceTag != null) "${listing.place} · $distanceTag" else listing.place,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (distanceTag != null) AppAccentText else AppText2
                    )
                }
            }
        }
    }
}

@Composable
fun CompactListCard(
    listing: Listing,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .border(1.dp, AppLine, RoundedCornerShape(24.dp))
            .background(AppSurface)
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(104.dp)
                .height(96.dp)
        ) {
            StorefrontImage(
                listing = listing,
                modifier = Modifier.fillMaxSize()
            )
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = listing.name,
                fontSize = 17.sp,
                fontWeight = FontWeight.ExtraBold,
                color = AppText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = DirectoryConstants.metaOf(listing),
                fontSize = 12.5.sp,
                color = AppText3,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            KashFlagsRow(listing = listing)
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = AppText3,
            modifier = Modifier
                .padding(end = 12.dp)
                .size(18.dp)
        )
    }
}

@Composable
fun FloatingTabBar(
    activeTab: String,
    savedCount: Int,
    onTabSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val tabs = listOf(
        Triple("browse", "Browse", Icons.Filled.GridView),
        Triple("search", "Search", Icons.Filled.Search),
        Triple("saved", "Saved", Icons.Filled.Favorite),
        Triple("about", "Guide", Icons.Filled.Info)
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 14.dp, vertical = 8.dp)
            .shadow(16.dp, RoundedCornerShape(30.dp), spotColor = Color(0x66000000))
            .clip(RoundedCornerShape(30.dp))
            .border(1.dp, AppLine2, RoundedCornerShape(30.dp))
            .background(GlassBg)
            .padding(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            tabs.forEach { (tabId, label, icon) ->
                val isSelected = activeTab == tabId
                val tabBg = if (isSelected) {
                    Modifier
                        .shadow(8.dp, RoundedCornerShape(24.dp), spotColor = Color(0x66FFA01E))
                        .background(GoldGradient, RoundedCornerShape(24.dp))
                } else {
                    Modifier
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .then(tabBg)
                        .clickable { onTabSelected(tabId) },
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Box {
                            Icon(
                                imageVector = icon,
                                contentDescription = label,
                                tint = if (isSelected) AppAccentInk else AppText3,
                                modifier = Modifier.size(23.dp)
                            )
                            if (tabId == "saved" && savedCount > 0) {
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .offset(x = 8.dp, y = (-4).dp)
                                        .clip(CircleShape)
                                        .background(AppErr)
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = savedCount.toString(),
                                        color = Color.White,
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }
                        }
                        Text(
                            text = label,
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) AppAccentInk else AppText3,
                            letterSpacing = 0.03.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ToastNotification(
    message: String?,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = message != null,
        enter = slideInVertically(initialOffsetY = { 50 }) + fadeIn(),
        exit = slideOutVertically(targetOffsetY = { 50 }) + fadeOut(),
        modifier = modifier
    ) {
        if (message != null) {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(AppText)
                    .padding(horizontal = 18.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(9.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = null,
                    tint = AppOk,
                    modifier = Modifier.size(17.dp)
                )
                Text(
                    text = message,
                    color = AppBg,
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
