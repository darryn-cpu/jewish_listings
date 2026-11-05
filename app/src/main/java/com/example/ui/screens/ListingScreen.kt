package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.ui.components.KashFlagsRow
import com.example.ui.components.ListingLogo
import com.example.ui.components.StoreMark
import com.example.ui.components.StorefrontImage
import com.example.ui.theme.AppAccent
import com.example.ui.theme.AppAccentInk
import com.example.ui.theme.AppAccentLine
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
import com.example.ui.theme.GoldGradient
import kotlinx.coroutines.launch

@Composable
fun ListingScreen(
    listing: Listing,
    isSaved: Boolean,
    onToggleSave: () -> Unit,
    onOpenCategoryInDistrict: (categoryId: String) -> Unit,
    scrollState: LazyListState = rememberLazyListState(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var activeSection by remember { mutableStateOf("about") }

    val firstPhone = listing.phones.firstOrNull()

    fun openUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun openDialer(tel: String) {
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$tel"))
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun openMaps() {
        if (listing.maps.isNotEmpty()) {
            openUrl(listing.maps[0])
        } else {
            val q = if (listing.address.isNotEmpty()) listing.address else "${listing.name} South Africa"
            openUrl("https://www.google.com/maps/search/?api=1&query=${Uri.encode(q)}")
        }
    }

    fun cleanHost(rawUrl: String): String {
        return try {
            val uri = Uri.parse(rawUrl)
            uri.host?.removePrefix("www.") ?: rawUrl
        } catch (e: Exception) {
            rawUrl
        }
    }

    LazyColumn(
        state = scrollState,
        modifier = modifier.fillMaxSize()
    ) {
        // Hero Storefront Art
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(8f / 5f)
                    .clip(RoundedCornerShape(bottomStart = 40.dp, bottomEnd = 40.dp))
            ) {
                StorefrontImage(
                    listing = listing,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // Identity block: Logo, Name, Story, Meta, Kashrut
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .offset(y = (-46).dp)
            ) {
                ListingLogo(
                    listing = listing,
                    size = 84.dp,
                    modifier = Modifier.padding(bottom = 14.dp)
                )

                Text(
                    text = listing.name,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    lineHeight = 36.sp,
                    letterSpacing = (-0.05).sp
                )

                Text(
                    text = DirectoryConstants.storyOf(listing),
                    fontSize = 19.sp,
                    fontStyle = FontStyle.Italic,
                    fontFamily = FontFamily.Serif,
                    color = AppAccentText,
                    lineHeight = 25.sp,
                    modifier = Modifier.padding(top = 8.dp, bottom = 12.dp)
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint = AppText2,
                        modifier = Modifier.size(15.dp)
                    )
                    Text(
                        text = "${listing.place} · ${DirectoryConstants.cityLabel(listing.city)}",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppText2
                    )
                }

                KashFlagsRow(
                    listing = listing,
                    modifier = Modifier.padding(top = 12.dp)
                )

                // Quick Action Buttons (Save, Map, Call/WA)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 22.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Save Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(66.dp)
                            .clip(RoundedCornerShape(22.dp))
                            .border(1.dp, if (isSaved) AppAccentLine else AppLine2, RoundedCornerShape(22.dp))
                            .background(if (isSaved) AppAccentSoft else GlassBg)
                            .clickable(onClick = onToggleSave),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                contentDescription = null,
                                tint = if (isSaved) AppAccentText else AppText,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = if (isSaved) "Saved" else "Save",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSaved) AppAccentText else AppText
                            )
                        }
                    }

                    // Map Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(66.dp)
                            .clip(RoundedCornerShape(22.dp))
                            .border(1.dp, AppLine2, RoundedCornerShape(22.dp))
                            .background(GlassBg)
                            .clickable { openMaps() },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.LocationOn,
                                contentDescription = null,
                                tint = AppText,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = "Map",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppText
                            )
                        }
                    }

                    // Call / WhatsApp Primary Button
                    val isWhatsApp = firstPhone?.wa == true
                    Box(
                        modifier = Modifier
                            .weight(1.25f)
                            .height(66.dp)
                            .shadow(12.dp, RoundedCornerShape(22.dp), spotColor = Color(0x66FFA01E))
                            .clip(RoundedCornerShape(22.dp))
                            .background(GoldGradient)
                            .clickable {
                                if (firstPhone != null) {
                                    if (isWhatsApp) {
                                        val digits = firstPhone.tel.replace("\\D".toRegex(), "")
                                        openUrl("https://wa.me/$digits")
                                    } else {
                                        openDialer(firstPhone.tel)
                                    }
                                } else {
                                    coroutineScope.launch { scrollState.animateScrollToItem(4) }
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Phone,
                                contentDescription = null,
                                tint = AppAccentInk,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = if (firstPhone != null) (if (isWhatsApp) "WhatsApp" else "Call") else "Contact",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppAccentInk
                            )
                        }
                    }
                }
            }
        }

        // Sticky navigation: About & Contact
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .border(1.dp, AppLine, RoundedCornerShape(18.dp))
                    .background(GlassBg)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                val isAbout = activeSection == "about"
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(15.dp))
                        .then(if (isAbout) Modifier.background(GoldGradient) else Modifier)
                        .clickable {
                            activeSection = "about"
                            coroutineScope.launch { scrollState.animateScrollToItem(3) }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "About",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isAbout) AppAccentInk else AppText3
                    )
                }

                val isContact = activeSection == "contact"
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(15.dp))
                        .then(if (isContact) Modifier.background(GoldGradient) else Modifier)
                        .clickable {
                            activeSection = "contact"
                            coroutineScope.launch { scrollState.animateScrollToItem(4) }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Contact",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isContact) AppAccentInk else AppText3
                    )
                }
            }
        }

        // About section
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp, vertical = 24.dp)
            ) {
                Text(
                    text = "ABOUT",
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppAccentText,
                    letterSpacing = 0.16.sp
                )
                Text(
                    text = listing.name,
                    fontSize = 25.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.04).sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                )

                if (!listing.desc.isNullOrEmpty()) {
                    Text(
                        text = listing.desc,
                        fontSize = 15.sp,
                        lineHeight = 24.sp,
                        color = AppText2,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }

                if (listing.notes.isNotEmpty()) {
                    Text(
                        text = listing.notes,
                        fontSize = 15.sp,
                        lineHeight = 23.sp,
                        color = AppText2,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                } else if (listing.desc.isNullOrEmpty()) {
                    Text(
                        text = "${listing.name} is listed as ${listing.cats.joinToString(", ") { DirectoryConstants.catName(it) }} in ${listing.place}.",
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                        color = AppText2,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                }

                Text(
                    text = "CATEGORIES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppText3,
                    letterSpacing = 0.13.sp,
                    modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listing.cats.forEach { catId ->
                        Box(
                            modifier = Modifier
                                .height(38.dp)
                                .clip(CircleShape)
                                .border(1.dp, AppAccentLine, CircleShape)
                                .background(AppAccentSoft)
                                .clickable { onOpenCategoryInDistrict(catId) }
                                .padding(horizontal = 15.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = DirectoryConstants.catName(catId),
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = AppAccentText
                            )
                        }
                    }
                }
            }
        }

        // Contact Section ("As published")
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp)
                    .border(width = 0.5.dp, color = AppLine)
                    .padding(top = 24.dp)
            ) {
                Text(
                    text = "CONTACT",
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppAccentText,
                    letterSpacing = 0.16.sp
                )
                Text(
                    text = "As published",
                    fontSize = 25.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = AppText,
                    letterSpacing = (-0.04).sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                )

                // Contact card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .border(1.dp, AppLine, RoundedCornerShape(24.dp))
                        .background(AppSurface)
                ) {
                    // Address
                    if (listing.address.isNotEmpty()) {
                        ContactRow(
                            icon = Icons.Filled.LocationOn,
                            label = "Address",
                            value = listing.address
                        )
                    }

                    // Open in Google Maps
                    ContactRow(
                        icon = Icons.Filled.LocationOn,
                        label = "Map",
                        value = "Open in Google Maps",
                        isLink = true,
                        onClick = { openMaps() }
                    )

                    // Phones
                    listing.phones.forEach { phone ->
                        val kind = if (phone.wa) "WhatsApp" else "Phone"
                        val label = if (phone.label.isNotEmpty()) "$kind · ${phone.label}" else (if (phone.wa) "WhatsApp · tap to chat" else "Phone · tap to call")
                        ContactRow(
                            icon = Icons.Filled.Phone,
                            label = label,
                            value = phone.disp,
                            isLink = true,
                            onClick = {
                                if (phone.wa) {
                                    val digits = phone.tel.replace("\\D".toRegex(), "")
                                    openUrl("https://wa.me/$digits")
                                } else {
                                    openDialer(phone.tel)
                                }
                            }
                        )
                    }

                    // Emails
                    listing.emails.forEach { email ->
                        ContactRow(
                            icon = Icons.Filled.Email,
                            label = "Email",
                            value = email,
                            isLink = true,
                            onClick = { openUrl("mailto:$email") }
                        )
                    }

                    // Websites
                    listing.webs.forEach { web ->
                        ContactRow(
                            icon = Icons.Filled.Language,
                            label = "Website",
                            value = cleanHost(web),
                            isLink = true,
                            onClick = { openUrl(web) }
                        )
                    }

                    // Instagram
                    if (listing.ig.isNotEmpty()) {
                        ContactRow(
                            icon = Icons.Filled.Language,
                            label = "Instagram",
                            value = cleanHost(listing.ig),
                            isLink = true,
                            onClick = { openUrl(listing.ig) }
                        )
                    }

                    // Facebook
                    if (listing.fb.isNotEmpty()) {
                        ContactRow(
                            icon = Icons.Filled.Language,
                            label = "Facebook",
                            value = "Open page",
                            isLink = true,
                            onClick = { openUrl(listing.fb) }
                        )
                    }

                    // If no contact details published
                    if (listing.address.isEmpty() && listing.phones.isEmpty() && listing.emails.isEmpty() && listing.webs.isEmpty()) {
                        ContactRow(
                            icon = Icons.Filled.Phone,
                            label = "Contact",
                            value = "No phone or email was published for this listing."
                        )
                    }
                }
            }
        }

        // Footer with Ref
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp, vertical = 32.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StoreMark(size = 24.dp)
                Text(
                    text = "${listing.name} is listed in the Kosher SA shopping and dining directory on Jewish Yellow Pages.${if (!listing.post.isNullOrEmpty()) " Ref ${listing.post}." else ""}",
                    fontSize = 12.5.sp,
                    lineHeight = 18.sp,
                    color = AppText3
                )
            }
        }
    }
}

@Composable
private fun ContactRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    isLink: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    val clickModifier = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .then(clickModifier)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = AppAccentText,
            modifier = Modifier.size(20.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label.uppercase(),
                fontSize = 10.5.sp,
                fontWeight = FontWeight.Bold,
                color = AppText3,
                letterSpacing = 0.1.sp
            )
            Text(
                text = value,
                fontSize = 14.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppText,
                textDecoration = if (isLink) TextDecoration.Underline else TextDecoration.None
            )
        }
        if (isLink) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = AppText3,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}
