package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.District
import com.example.data.Listing
import com.example.ui.components.CompactListCard
import com.example.ui.components.KashChipsRow
import com.example.ui.components.StoreCard
import com.example.ui.components.hslColor
import com.example.ui.theme.AppAccent
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppLine2
import com.example.ui.theme.AppSurface
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.Glass2Bg
import com.example.ui.theme.GoldGradient

@Composable
fun DistrictScreen(
    districtId: String,
    initialCategoryId: String = "all",
    listings: List<Listing>,
    selectedCity: String,
    selectedKash: List<String>,
    currentView: String, // "cards" or "list"
    savedIds: List<String>,
    scrollState: LazyListState,
    onViewChange: (String) -> Unit,
    onOpenListing: (String) -> Unit,
    onToggleKash: (String) -> Unit,
    onClearKash: () -> Unit,
    onToggleSave: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val district = remember(districtId) { DirectoryConstants.distById(districtId) }
    var selectedCat by remember { mutableStateOf(initialCategoryId) }
    var sortOrder by remember { mutableStateOf("az") } // "az" or "listed"

    val scopeLine = remember(selectedCity) {
        if (selectedCity == "All") "South Africa" else DirectoryConstants.cityLabel(selectedCity)
    }

    val activeCats = remember(selectedCat, district) {
        if (selectedCat == "all") district.cats else listOf(selectedCat)
    }

    val filteredListings = remember(listings, activeCats, sortOrder) {
        val inCats = listings.filter { b -> b.cats.any { activeCats.contains(it) } }
        if (sortOrder == "listed") {
            inCats.sortedBy { it.i }
        } else {
            inCats.sortedBy { it.name }
        }
    }

    val displayTitle = remember(selectedCat, district) {
        if (selectedCat == "all") district.name else DirectoryConstants.catName(selectedCat)
    }

    val hue = district.hue
    val bgStart = remember(hue) { hslColor(hue, 88f, 56f).copy(alpha = 0.36f) }
    val bgEnd = remember(hue) { hslColor(hue, 70f, 32f).copy(alpha = 0.10f) }
    val borderCol = remember(hue) { hslColor(hue, 80f, 62f).copy(alpha = 0.38f) }

    LazyColumn(
        state = scrollState,
        modifier = modifier
            .padding(horizontal = 18.dp)
            .padding(bottom = 96.dp)
    ) {
        // District Hero
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .border(1.dp, borderCol, RoundedCornerShape(32.dp))
                    .background(Brush.linearGradient(listOf(bgStart, bgEnd)))
                    .background(AppSurface.copy(alpha = 0.8f))
                    .padding(22.dp, 20.dp)
            ) {
                Column {
                    Text(
                        text = district.name.uppercase(),
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppAccentText,
                        letterSpacing = 0.16.sp
                    )
                    Text(
                        text = displayTitle,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = AppText,
                        letterSpacing = (-0.045).sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 4.dp)
                    )
                    Text(
                        text = "${filteredListings.size} ${if (filteredListings.size == 1) "listing" else "listings"} · $scopeLine",
                        fontSize = 14.5.sp,
                        color = AppText2
                    )
                }
            }
        }

        // Category chips (if > 1 category)
        if (district.cats.size > 1) {
            item {
                Spacer(modifier = Modifier.height(14.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val allSelected = selectedCat == "all"
                    Box(
                        modifier = Modifier
                            .height(38.dp)
                            .clip(CircleShape)
                            .then(
                                if (allSelected) Modifier.background(GoldGradient)
                                else Modifier
                                    .border(1.dp, AppLine2, CircleShape)
                                    .background(Glass2Bg)
                            )
                            .clickable { selectedCat = "all" }
                            .padding(horizontal = 15.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "All",
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (allSelected) AppAccentInk else AppText
                        )
                    }

                    district.cats.forEach { catId ->
                        val isSelected = selectedCat == catId
                        Box(
                            modifier = Modifier
                                .height(38.dp)
                                .clip(CircleShape)
                                .then(
                                    if (isSelected) Modifier.background(GoldGradient)
                                    else Modifier
                                        .border(1.dp, AppLine2, CircleShape)
                                        .background(Glass2Bg)
                                )
                                .clickable { selectedCat = catId }
                                .padding(horizontal = 15.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = DirectoryConstants.catName(catId),
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isSelected) AppAccentInk else AppText
                            )
                        }
                    }
                }
            }
        }

        // Kashrut Filter Section
        item {
            Column(modifier = Modifier.padding(vertical = 12.dp)) {
                Text(
                    text = "KASHRUT",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.13.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                KashChipsRow(
                    selectedKash = selectedKash,
                    onToggleKash = onToggleKash,
                    onClearKash = onClearKash
                )
            }
        }

        // Sortbar + View selector
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Sort Segment
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(15.dp))
                        .border(1.dp, AppLine, RoundedCornerShape(15.dp))
                        .background(Glass2Bg)
                        .padding(2.dp),
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    val azSelected = sortOrder == "az"
                    Box(
                        modifier = Modifier
                            .height(34.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .then(if (azSelected) Modifier.background(GoldGradient) else Modifier)
                            .clickable { sortOrder = "az" }
                            .padding(horizontal = 13.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "A–Z",
                            fontSize = 12.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (azSelected) AppAccentInk else AppText2
                        )
                    }

                    val listedSelected = sortOrder == "listed"
                    Box(
                        modifier = Modifier
                            .height(34.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .then(if (listedSelected) Modifier.background(GoldGradient) else Modifier)
                            .clickable { sortOrder = "listed" }
                            .padding(horizontal = 13.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "As listed",
                            fontSize = 12.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (listedSelected) AppAccentInk else AppText2
                        )
                    }
                }

                // View Segment (Cards vs List)
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(15.dp))
                        .border(1.dp, AppLine, RoundedCornerShape(15.dp))
                        .background(Glass2Bg)
                        .padding(2.dp),
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    val cardsSelected = currentView != "list"
                    Box(
                        modifier = Modifier
                            .size(38.dp, 34.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .then(if (cardsSelected) Modifier.background(GoldGradient) else Modifier)
                            .clickable { onViewChange("cards") },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.GridView,
                            contentDescription = "Storefront cards",
                            tint = if (cardsSelected) AppAccentInk else AppText2,
                            modifier = Modifier.size(17.dp)
                        )
                    }

                    val listSelected = currentView == "list"
                    Box(
                        modifier = Modifier
                            .size(38.dp, 34.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .then(if (listSelected) Modifier.background(GoldGradient) else Modifier)
                            .clickable { onViewChange("list") },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.List,
                            contentDescription = "Compact list",
                            tint = if (listSelected) AppAccentInk else AppText2,
                            modifier = Modifier.size(17.dp)
                        )
                    }
                }
            }
        }

        // Listings or Empty State
        if (filteredListings.isNotEmpty()) {
            if (currentView == "list") {
                items(filteredListings, key = { it.id }) { listing ->
                    CompactListCard(
                        listing = listing,
                        onClick = { onOpenListing(listing.id) },
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                }
            } else {
                items(filteredListings, key = { it.id }) { listing ->
                    StoreCard(
                        listing = listing,
                        isSaved = savedIds.contains(listing.id),
                        onSaveToggle = { onToggleSave(listing.id) },
                        onClick = { onOpenListing(listing.id) },
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
        } else {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp)
                        .clip(RoundedCornerShape(28.dp))
                        .border(1.5.dp, AppLine2, RoundedCornerShape(28.dp))
                        .background(Glass2Bg)
                        .padding(32.dp, 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Nothing in this view",
                            fontSize = 21.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText
                        )
                        Text(
                            text = "No ${displayTitle.lowercase()} ${if (selectedCity == "All") "match these kashrut flags" else "in $scopeLine for these flags"}.",
                            fontSize = 14.sp,
                            color = AppText2
                        )
                        if (selectedKash.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Button(
                                onClick = onClearKash,
                                shape = RoundedCornerShape(15.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Glass2Bg,
                                    contentColor = AppText
                                ),
                                modifier = Modifier.border(1.dp, AppLine2, RoundedCornerShape(15.dp))
                            ) {
                                Text("Clear kashrut flags", fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
