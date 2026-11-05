package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.components.StoreCard
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentSoft
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppLine2
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.Glass2Bg
import com.example.ui.theme.GoldGradient

@Composable
fun SavedScreen(
    allSavedListings: List<Listing>,
    selectedCity: String,
    scrollState: LazyListState,
    onOpenListing: (String) -> Unit,
    onToggleSave: (String) -> Unit,
    onNavigateToBrowse: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hereListings = remember(allSavedListings, selectedCity) {
        if (selectedCity == "All") allSavedListings else allSavedListings.filter { it.city == selectedCity }
    }
    val awayCount = remember(allSavedListings, hereListings) {
        allSavedListings.size - hereListings.size
    }

    val scopeLine = remember(selectedCity) {
        if (selectedCity == "All") "South Africa" else DirectoryConstants.cityLabel(selectedCity)
    }

    LazyColumn(
        state = scrollState,
        modifier = modifier
            .padding(horizontal = 18.dp)
            .padding(bottom = 96.dp)
    ) {
        if (allSavedListings.isEmpty()) {
            // Nothing saved at all
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 48.dp)
                        .clip(RoundedCornerShape(28.dp))
                        .border(1.5.dp, AppLine2, RoundedCornerShape(28.dp))
                        .background(Glass2Bg)
                        .padding(46.dp, 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .clip(RoundedCornerShape(22.dp))
                                .background(AppAccentSoft),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Favorite,
                                contentDescription = null,
                                tint = AppAccentText,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Text(
                            text = "Nothing saved yet",
                            fontSize = 21.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AppText
                        )

                        Text(
                            text = "Tap the heart on a storefront to keep it on this device.",
                            fontSize = 14.sp,
                            color = AppText2
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Box(
                            modifier = Modifier
                                .height(52.dp)
                                .shadow(8.dp, RoundedCornerShape(19.dp), spotColor = Color(0x66FFA01E))
                                .clip(RoundedCornerShape(19.dp))
                                .background(GoldGradient)
                                .clickable(onClick = onNavigateToBrowse)
                                .padding(horizontal = 22.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Browse the directory",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppAccentInk
                            )
                        }
                    }
                }
            }
        } else {
            // Saved header
            item {
                Column(modifier = Modifier.padding(top = 16.dp, bottom = 12.dp)) {
                    Text(
                        text = "ON THIS DEVICE",
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppAccentText,
                        letterSpacing = 0.16.sp
                    )
                    Text(
                        text = "Saved",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = AppText,
                        letterSpacing = (-0.045).sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 4.dp)
                    )
                    Text(
                        text = "${hereListings.size} ${if (hereListings.size == 1) "listing" else "listings"} · $scopeLine",
                        fontSize = 14.5.sp,
                        color = AppText2
                    )
                }
            }

            if (hereListings.isNotEmpty()) {
                items(hereListings, key = { it.id }) { listing ->
                    StoreCard(
                        listing = listing,
                        isSaved = true,
                        onSaveToggle = { onToggleSave(listing.id) },
                        onClick = { onOpenListing(listing.id) },
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            } else {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .border(1.dp, AppLine2, RoundedCornerShape(18.dp))
                            .background(Glass2Bg)
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Nothing saved in $scopeLine.",
                            fontSize = 13.5.sp,
                            color = AppText3
                        )
                    }
                }
            }

            if (awayCount > 0) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 18.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Info,
                            contentDescription = null,
                            tint = AppText3,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "$awayCount saved in another city. Switch city to see them.",
                            fontSize = 12.5.sp,
                            color = AppText3
                        )
                    }
                }
            }
        }
    }
}
