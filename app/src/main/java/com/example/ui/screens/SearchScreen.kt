package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.data.NearestResult
import com.example.data.SearchResult
import com.example.ui.components.CompactListCard
import com.example.ui.components.KashChipsRow
import com.example.ui.theme.AppAccent
import com.example.ui.theme.AppAccentSoft
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppLine2
import com.example.ui.theme.AppSurface
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.Glass2Bg
import com.example.ui.theme.GlassBg

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    query: String,
    searchResult: SearchResult,
    recentSearches: List<String>,
    selectedKash: List<String>,
    selectedCity: String,
    savedIds: List<String>,
    isLocating: Boolean,
    nearestResults: List<NearestResult>,
    candidateCount: Int,
    focusSearchOnLaunch: Boolean,
    scrollState: LazyListState,
    onQueryChange: (String) -> Unit,
    onSubmitSearch: (String) -> Unit,
    onClearQuery: () -> Unit,
    onToggleKash: (String) -> Unit,
    onClearKash: () -> Unit,
    onFindClosest: () -> Unit,
    onDismissNearest: () -> Unit,
    onToggleSave: (String) -> Unit,
    onOpenListing: (String) -> Unit,
    onOpenCategoryInDistrict: (categoryId: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(focusSearchOnLaunch) {
        if (focusSearchOnLaunch) {
            focusRequester.requestFocus()
        }
    }

    val popularCategories = listOf(
        "Bakery", "Restaurant", "Caterer", "Butchery",
        "Supermarket", "Lodges-Safaris-Tours", "Deli", "Take Away"
    )

    LazyColumn(
        state = scrollState,
        modifier = modifier
            .padding(horizontal = 18.dp)
            .padding(bottom = 96.dp)
    ) {
        // Sticky-feeling search input
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .shadow(12.dp, RoundedCornerShape(23.dp), spotColor = Color(0x33000000))
                    .clip(RoundedCornerShape(23.dp))
                    .border(1.dp, AppLine2, RoundedCornerShape(23.dp))
                    .background(GlassBg)
                    .padding(horizontal = 15.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = null,
                    tint = AppAccentText,
                    modifier = Modifier.size(20.dp)
                )

                TextField(
                    value = query,
                    onValueChange = onQueryChange,
                    placeholder = {
                        Text(
                            text = "Search a business, suburb or category",
                            fontSize = 16.sp,
                            color = AppText3
                        )
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            if (query.isNotBlank()) {
                                onSubmitSearch(query)
                                keyboardController?.hide()
                            }
                        }
                    ),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        disabledContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .focusRequester(focusRequester)
                )

                if (query.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Glass2Bg)
                            .clickable(onClick = onClearQuery),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Clear search",
                            tint = AppText2,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        // Kashrut Section
        item {
            Column(modifier = Modifier.padding(vertical = 12.dp)) {
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
            val isFiltering = query.isNotBlank() || selectedCity != "All" || selectedKash.isNotEmpty()
            ClosestToMeButton(
                isFiltering = isFiltering,
                isLocating = isLocating,
                listingCount = candidateCount,
                onClick = onFindClosest,
                modifier = Modifier.padding(vertical = 4.dp)
            )
        }

        // Nearest Results when GPS calculation produces results (top 5 closest)
        if (nearestResults.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
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

        // Empty query view: Recent searches & Categories
        if (query.trim().isEmpty()) {
            // Recent searches
            if (recentSearches.isNotEmpty()) {
                item {
                    Text(
                        text = "RECENT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppText3,
                        letterSpacing = 0.15.sp,
                        modifier = Modifier.padding(top = 14.dp, bottom = 8.dp)
                    )
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        recentSearches.forEach { term ->
                            Box(
                                modifier = Modifier
                                    .height(38.dp)
                                    .clip(CircleShape)
                                    .border(1.dp, AppLine2, CircleShape)
                                    .background(Glass2Bg)
                                    .clickable {
                                        onQueryChange(term)
                                        onSubmitSearch(term)
                                    }
                                    .padding(horizontal = 15.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = term,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AppText
                                )
                            }
                        }
                    }
                }
            }

            // Categories list
            item {
                Text(
                    text = "CATEGORIES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.15.sp,
                    modifier = Modifier.padding(top = 20.dp, bottom = 8.dp)
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    popularCategories.forEach { catId ->
                        Box(
                            modifier = Modifier
                                .height(38.dp)
                                .clip(CircleShape)
                                .border(1.dp, AppLine2, CircleShape)
                                .background(Glass2Bg)
                                .clickable { onOpenCategoryInDistrict(catId) }
                                .padding(horizontal = 15.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = DirectoryConstants.catName(catId),
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = AppText
                            )
                        }
                    }
                }
            }
        } else {
            // Query has results
            val hasCategories = searchResult.matchingCategories.isNotEmpty()
            val hasBusinesses = searchResult.matchingListings.isNotEmpty()

            if (!hasCategories && !hasBusinesses) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp)
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
                            Icon(
                                imageVector = Icons.Filled.Search,
                                contentDescription = null,
                                tint = AppAccentText,
                                modifier = Modifier.size(36.dp)
                            )
                            Text(
                                text = "Nothing matches “${query.trim()}”",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AppText
                            )
                            Text(
                                text = "Try a business name, a suburb, or a category such as bakery or lodge.",
                                fontSize = 13.5.sp,
                                color = AppText2
                            )
                        }
                    }
                }
            } else {
                // Category hits
                if (hasCategories) {
                    item {
                        Text(
                            text = "CATEGORIES",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AppText3,
                            letterSpacing = 0.15.sp,
                            modifier = Modifier.padding(top = 18.dp, bottom = 8.dp)
                        )
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(24.dp))
                                .border(1.dp, AppLine, RoundedCornerShape(24.dp))
                                .background(AppSurface)
                        ) {
                            searchResult.matchingCategories.take(6).forEach { catId ->
                                val dist = DirectoryConstants.distOfCat(catId)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { onOpenCategoryInDistrict(catId) }
                                        .padding(14.dp, 15.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(13.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(AppAccentSoft),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = DirectoryConstants.catName(catId).take(1),
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 16.sp,
                                            color = AppAccentText
                                        )
                                    }

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = DirectoryConstants.catName(catId),
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = AppText
                                        )
                                        if (dist != null) {
                                            Text(
                                                text = dist.name,
                                                fontSize = 12.5.sp,
                                                color = AppText3
                                            )
                                        }
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

                // Grouped Business Hits: Johannesburg, Cape Town, Further afield
                val cityGroups = if (selectedCity == "All") {
                    listOf("Johannesburg", "Cape Town", "Other")
                } else {
                    listOf(selectedCity)
                }

                cityGroups.forEach { cityGroup ->
                    val groupListings = searchResult.matchingListings.filter { it.city == cityGroup }
                    if (groupListings.isNotEmpty()) {
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 24.dp, bottom = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = DirectoryConstants.cityLabel(cityGroup).uppercase(),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AppText3,
                                    letterSpacing = 0.15.sp
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .border(1.dp, AppLine, RoundedCornerShape(10.dp))
                                        .background(Glass2Bg)
                                        .padding(horizontal = 9.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = groupListings.size.toString(),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AppText2
                                    )
                                }
                            }
                        }

                        items(groupListings, key = { it.id }) { listing ->
                            CompactListCard(
                                listing = listing,
                                onClick = { onOpenListing(listing.id) },
                                modifier = Modifier.padding(vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
