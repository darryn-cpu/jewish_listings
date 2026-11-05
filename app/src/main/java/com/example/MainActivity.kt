package com.example

import android.content.pm.ActivityInfo
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.example.data.DirectoryConstants
import com.example.ui.MainViewModel
import com.example.ui.ScreenDestination
import com.example.ui.components.AppHeader
import com.example.ui.components.AuroraBackground
import com.example.ui.components.FloatingTabBar
import com.example.ui.components.ToastNotification
import com.example.ui.screens.BrowseScreen
import com.example.ui.screens.DistrictScreen
import com.example.ui.screens.GuideScreen
import com.example.ui.screens.IntroSplashScreen
import com.example.ui.screens.ListingScreen
import com.example.ui.screens.SavedScreen
import com.example.ui.screens.SearchScreen
import com.example.ui.theme.MyApplicationTheme
import kotlinx.coroutines.flow.collectLatest
import kotlin.math.abs

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                MainApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainApp(viewModel: MainViewModel) {
    var showIntro by rememberSaveable { mutableStateOf(!viewModel.isIntroCompleted) }

    val userPreferences by viewModel.userPreferences.collectAsState()
    val currentTab by viewModel.currentTab.collectAsState()
    val browseStack by viewModel.browseStack.collectAsState()
    val searchStack by viewModel.searchStack.collectAsState()
    val savedStack by viewModel.savedStack.collectAsState()
    val guideStack by viewModel.guideStack.collectAsState()

    val filteredListings by viewModel.currentFilteredListings.collectAsState()
    val searchResult by viewModel.currentSearchResult.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val browseSearchQuery by viewModel.browseSearchQuery.collectAsState()
    val isLocating by viewModel.isLocating.collectAsState()
    val nearestResults by viewModel.nearestResults.collectAsState()
    val userLocation by viewModel.userLocation.collectAsState()
    val focusSearchOnLaunch by viewModel.focusSearchOnLaunch.collectAsState()
    val toastMessage by viewModel.toastMessage.collectAsState()

    val context = androidx.compose.ui.platform.LocalContext.current
    val locationPermissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        contract = androidx.activity.result.contract.ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[android.Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[android.Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            viewModel.calculateClosestToMe(context) {}
        } else {
            viewModel.showToast("Location permission was not granted.")
        }
    }

    val browseScrollState = rememberLazyListState()
    val searchScrollState = rememberLazyListState()
    val savedScrollState = rememberLazyListState()
    val guideScrollState = rememberLazyListState()
    val districtScrollState = rememberLazyListState()
    val listingScrollState = rememberLazyListState()

    // Listen to re-tap scroll-to-top events
    LaunchedEffect(Unit) {
        viewModel.scrollToTopEvents.collectLatest { tab ->
            when (tab) {
                "browse" -> browseScrollState.animateScrollToItem(0)
                "search" -> searchScrollState.animateScrollToItem(0)
                "saved" -> savedScrollState.animateScrollToItem(0)
                "about" -> guideScrollState.animateScrollToItem(0)
            }
        }
    }

    val currentStack = when (currentTab) {
        "browse" -> browseStack
        "search" -> searchStack
        "saved" -> savedStack
        "about" -> guideStack
        else -> browseStack
    }

    val currentDestination = currentStack.lastOrNull() ?: ScreenDestination.BrowseRoot
    val canGoBack = currentStack.size > 1

    // System Back Handler
    BackHandler(enabled = canGoBack) {
        viewModel.popBack()
    }

    // Header title & subtitle
    val scopeLine = if (userPreferences.city == "All") "South Africa" else DirectoryConstants.cityLabel(userPreferences.city)
    val (headerTitle, headerSubtitle) = when (currentDestination) {
        is ScreenDestination.DistrictDest -> {
            val dist = DirectoryConstants.distById(currentDestination.districtId)
            val title = if (currentDestination.categoryId != "all") {
                DirectoryConstants.catName(currentDestination.categoryId)
            } else {
                dist.name
            }
            title to scopeLine
        }
        is ScreenDestination.ListingDest -> {
            val listing = viewModel.allListings.firstOrNull { it.id == currentDestination.listingId }
            (listing?.name ?: "Listing") to "${listing?.place.orEmpty()} · ${DirectoryConstants.cityLabel(listing?.city.orEmpty())}"
        }
        else -> "" to ""
    }

    val isListingScreen = currentDestination is ScreenDestination.ListingDest
    val showCityFilterInHeader = !isListingScreen

    val savedListings = remember(userPreferences.savedIds, viewModel.allListings) {
        userPreferences.savedIds.mapNotNull { id -> viewModel.allListings.firstOrNull { it.id == id } }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            // Left-edge swipe gesture: starts within 32dp, moves right > 64dp
            .pointerInput(canGoBack) {
                if (canGoBack) {
                    awaitEachGesture {
                        val down = awaitFirstDown(requireUnconsumed = false)
                        if (down.position.x <= 32.dp.toPx()) {
                            var totalDx = 0f
                            var totalDy = 0f
                            val startTime = System.currentTimeMillis()
                            var triggered = false

                            do {
                                val event = awaitPointerEvent()
                                val change = event.changes.firstOrNull { it.id == down.id }
                                if (change != null) {
                                    totalDx = change.position.x - down.position.x
                                    totalDy = change.position.y - down.position.y
                                    if (totalDx > 64.dp.toPx() && abs(totalDy) < 80.dp.toPx() && abs(totalDx) > abs(totalDy)) {
                                        triggered = true
                                    }
                                }
                            } while (event.changes.any { it.pressed })

                            val elapsed = System.currentTimeMillis() - startTime
                            if (triggered && elapsed < 700) {
                                viewModel.popBack()
                            }
                        } else {
                            // Wait for pointer release before ending gesture
                            do {
                                val event = awaitPointerEvent()
                            } while (event.changes.any { it.pressed })
                        }
                    }
                }
            }
    ) {
        // Aurora blurred gradient background
        AuroraBackground()

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                AppHeader(
                    canGoBack = canGoBack,
                    title = headerTitle,
                    subtitle = headerSubtitle,
                    showCityFilter = showCityFilterInHeader,
                    selectedCity = userPreferences.city,
                    onBack = { viewModel.popBack() },
                    onCitySelected = { viewModel.setCity(it) }
                )
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Screen content
                AnimatedContent(
                    targetState = currentDestination,
                    transitionSpec = {
                        slideInHorizontally(initialOffsetX = { 40 }) + fadeIn() togetherWith
                                slideOutHorizontally(targetOffsetX = { -20 }) + fadeOut()
                    },
                    label = "screenTransition"
                ) { destination ->
                    when (destination) {
                        ScreenDestination.BrowseRoot -> {
                            BrowseScreen(
                                listings = filteredListings,
                                selectedCity = userPreferences.city,
                                selectedKash = userPreferences.kash,
                                savedIds = userPreferences.savedIds,
                                browseSearchQuery = browseSearchQuery,
                                isLocating = isLocating,
                                nearestResults = nearestResults,
                                userLocation = userLocation,
                                scrollState = browseScrollState,
                                onBrowseSearchChange = { viewModel.setBrowseSearchQuery(it) },
                                onClearBrowseSearch = { viewModel.clearBrowseSearchQuery() },
                                onFindClosest = {
                                    viewModel.calculateClosestToMe(context) {
                                        locationPermissionLauncher.launch(
                                            arrayOf(
                                                android.Manifest.permission.ACCESS_FINE_LOCATION,
                                                android.Manifest.permission.ACCESS_COARSE_LOCATION
                                            )
                                        )
                                    }
                                },
                                onDismissNearest = { viewModel.dismissNearestResults() },
                                onOpenSearch = { viewModel.openSearchFromBrowse() },
                                onOpenDistrict = { distId, catId ->
                                    viewModel.navigateToDistrict(distId, catId)
                                },
                                onOpenListing = { listingId ->
                                    viewModel.navigateToListing(listingId)
                                },
                                onToggleKash = { viewModel.toggleKash(it) },
                                onClearKash = { viewModel.clearKash() },
                                onToggleSave = { viewModel.toggleSave(it) }
                            )
                        }

                        ScreenDestination.SearchRoot -> {
                            val candidateCount = if (searchQuery.isNotBlank()) {
                                searchResult.matchingListings.size
                            } else {
                                filteredListings.size
                            }

                            SearchScreen(
                                query = searchQuery,
                                searchResult = searchResult,
                                recentSearches = userPreferences.recentSearches,
                                selectedKash = userPreferences.kash,
                                selectedCity = userPreferences.city,
                                savedIds = userPreferences.savedIds,
                                isLocating = isLocating,
                                nearestResults = nearestResults,
                                candidateCount = candidateCount,
                                focusSearchOnLaunch = focusSearchOnLaunch,
                                scrollState = searchScrollState,
                                onQueryChange = { viewModel.setSearchQuery(it) },
                                onSubmitSearch = { viewModel.submitSearch(it) },
                                onClearQuery = { viewModel.clearSearchQuery() },
                                onToggleKash = { viewModel.toggleKash(it) },
                                onClearKash = { viewModel.clearKash() },
                                onFindClosest = {
                                    viewModel.calculateClosestToMe(context) {
                                        locationPermissionLauncher.launch(
                                            arrayOf(
                                                android.Manifest.permission.ACCESS_FINE_LOCATION,
                                                android.Manifest.permission.ACCESS_COARSE_LOCATION
                                            )
                                        )
                                    }
                                },
                                onDismissNearest = { viewModel.dismissNearestResults() },
                                onToggleSave = { viewModel.toggleSave(it) },
                                onOpenListing = { listingId ->
                                    viewModel.navigateToListing(listingId)
                                },
                                onOpenCategoryInDistrict = { catId ->
                                    viewModel.navigateToCategoryInDistrict(catId)
                                }
                            )
                            if (focusSearchOnLaunch) {
                                viewModel.resetFocusSearch()
                            }
                        }

                        ScreenDestination.SavedRoot -> {
                            SavedScreen(
                                allSavedListings = savedListings,
                                selectedCity = userPreferences.city,
                                scrollState = savedScrollState,
                                onOpenListing = { listingId: String ->
                                    viewModel.navigateToListing(listingId)
                                },
                                onToggleSave = { id: String -> viewModel.toggleSave(id) },
                                onNavigateToBrowse = { viewModel.selectTab("browse") }
                            )
                        }

                        ScreenDestination.GuideRoot -> {
                            GuideScreen(
                                allListings = viewModel.allListings,
                                scrollState = guideScrollState
                            )
                        }

                        is ScreenDestination.DistrictDest -> {
                            DistrictScreen(
                                districtId = destination.districtId,
                                initialCategoryId = destination.categoryId,
                                listings = filteredListings,
                                selectedCity = userPreferences.city,
                                selectedKash = userPreferences.kash,
                                currentView = userPreferences.view,
                                savedIds = userPreferences.savedIds,
                                scrollState = districtScrollState,
                                onViewChange = { viewModel.setView(it) },
                                onOpenListing = { listingId ->
                                    viewModel.navigateToListing(listingId)
                                },
                                onToggleKash = { viewModel.toggleKash(it) },
                                onClearKash = { viewModel.clearKash() },
                                onToggleSave = { viewModel.toggleSave(it) }
                            )
                        }

                        is ScreenDestination.ListingDest -> {
                            val listing = viewModel.allListings.firstOrNull { it.id == destination.listingId }
                            if (listing != null) {
                                ListingScreen(
                                    listing = listing,
                                    isSaved = userPreferences.savedIds.contains(listing.id),
                                    onToggleSave = { viewModel.toggleSave(listing.id) },
                                    onOpenCategoryInDistrict = { catId ->
                                        viewModel.navigateToCategoryInDistrict(catId)
                                    },
                                    scrollState = listingScrollState
                                )
                            }
                        }
                    }
                }

                // Toast Notification
                ToastNotification(
                    message = toastMessage,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 96.dp)
                )

                // Floating Tab Bar (hidden on listing screen)
                AnimatedVisibility(
                    visible = !isListingScreen,
                    enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                    exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
                    modifier = Modifier.align(Alignment.BottomCenter)
                ) {
                    FloatingTabBar(
                        activeTab = currentTab,
                        savedCount = userPreferences.savedIds.size,
                        onTabSelected = { viewModel.selectTab(it) }
                    )
                }
            }
        }

        // Cold-start Intro Splash (res/raw/intro.mp4)
        if (showIntro) {
            IntroSplashScreen(
                onDismissed = {
                    showIntro = false
                    viewModel.isIntroCompleted = true
                }
            )
        }
    }
}
