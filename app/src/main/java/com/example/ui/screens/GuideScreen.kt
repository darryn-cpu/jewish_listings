package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.components.KashTagBadge
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentSoft
import com.example.ui.theme.AppAccentText
import com.example.ui.theme.AppLine
import com.example.ui.theme.AppSurface
import com.example.ui.theme.AppText
import com.example.ui.theme.AppText2
import com.example.ui.theme.AppText3
import com.example.ui.theme.GoldGradient

@Composable
fun GuideScreen(
    allListings: List<Listing>,
    scrollState: LazyListState,
    modifier: Modifier = Modifier
) {
    val jhbCount = remember(allListings) { allListings.count { it.city == "Johannesburg" } }
    val ctCount = remember(allListings) { allListings.count { it.city == "Cape Town" } }
    val otherCount = remember(allListings) { allListings.count { it.city == "Other" } }

    LazyColumn(
        state = scrollState,
        modifier = modifier
            .padding(horizontal = 18.dp)
            .padding(bottom = 96.dp)
    ) {
        // Welcome Card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 18.dp)
                    .clip(RoundedCornerShape(28.dp))
                    .border(1.dp, AppLine, RoundedCornerShape(28.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(AppAccentSoft, Color.Transparent)
                        )
                    )
                    .background(AppSurface)
                    .padding(24.dp, 20.dp)
            ) {
                Column {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .shadow(8.dp, RoundedCornerShape(18.dp), spotColor = Color(0x66FFA01E))
                            .clip(RoundedCornerShape(18.dp))
                            .background(GoldGradient),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Storefront,
                            contentDescription = null,
                            tint = AppAccentInk,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Shopping & dining",
                        fontSize = 25.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = AppText,
                        letterSpacing = (-0.04).sp
                    )

                    Text(
                        text = "A storefront view of the Kosher SA shopping and dining directory — ${allListings.size} listings, with the contact details and kashrut flags published in that list.",
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                        color = AppText2,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }

        // Stats Row (Johannesburg, Cape Town, Further afield)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    count = jhbCount,
                    label = "Johannesburg",
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    count = ctCount,
                    label = "Cape Town",
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    count = otherCount,
                    label = "Further afield",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Kashrut Flags Guide
        item {
            Text(
                text = "KASHRUT FLAGS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = AppText3,
                letterSpacing = 0.15.sp,
                modifier = Modifier.padding(top = 18.dp, bottom = 12.dp)
            )
        }

        items(DirectoryConstants.KASH_TAGS, key = { it.key }) { tag ->
            val count = remember(allListings, tag.key) {
                allListings.count { b ->
                    when (tag.key) {
                        "m" -> b.k.m
                        "d" -> b.k.d
                        "c" -> b.k.c
                        "p" -> b.k.p
                        "h" -> b.k.h
                        else -> false
                    }
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 5.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .border(1.dp, AppLine, RoundedCornerShape(20.dp))
                    .background(AppSurface)
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    KashTagBadge(key = tag.key, label = tag.label)
                    Text(
                        text = "${tag.help}. $count ${if (count == 1) "listing" else "listings"} in the directory.",
                        fontSize = 13.5.sp,
                        lineHeight = 20.sp,
                        color = AppText2
                    )
                }
            }
        }

        // Footnote
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Info,
                    contentDescription = null,
                    tint = AppText3,
                    modifier = Modifier
                        .size(16.dp)
                        .padding(top = 2.dp)
                )
                Text(
                    text = "A blank flag in the spreadsheet is not shown. Notes are the directory’s own remarks, including holiday-only kitchens and “by arrangement”.",
                    fontSize = 12.5.sp,
                    lineHeight = 18.sp,
                    color = AppText3
                )
            }
        }
    }
}

@Composable
private fun StatCard(
    count: Int,
    label: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(22.dp))
            .border(1.dp, AppLine, RoundedCornerShape(22.dp))
            .background(AppSurface)
            .padding(14.dp, 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = count.toString(),
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color = AppText,
                letterSpacing = (-0.04).sp
            )
            Text(
                text = label,
                fontSize = 11.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppText3,
                maxLines = 1
            )
        }
    }
}
