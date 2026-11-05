package com.example.ui

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.DirectoryConstants
import com.example.data.Listing
import com.example.data.ListingsRepository
import com.example.data.SearchResult
import com.example.data.UserPreferences
import com.example.data.UserPreferencesRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface ScreenDestination {
    data object BrowseRoot : ScreenDestination
    data object SearchRoot : ScreenDestination
    data object SavedRoot : ScreenDestination
    data object GuideRoot : ScreenDestination
    data class DistrictDest(val districtId: String, val categoryId: String = "all") : ScreenDestination
    data class ListingDest(val listingId: String) : ScreenDestination
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val listingsRepo = ListingsRepository(application)
    private val preferencesRepo = UserPreferencesRepository(application) {
        listingsRepo.listings.map { it.id }.toSet()
    }

    val allListings: List<Listing> = listingsRepo.listings

    // User preferences from DataStore
    val userPreferences: StateFlow<UserPreferences> = preferencesRepo.userPreferencesFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = UserPreferences()
        )

    // Tab and Navigation state
    private val _currentTab = MutableStateFlow("browse")
    val currentTab = _currentTab.asStateFlow()

    private val _browseStack = MutableStateFlow<List<ScreenDestination>>(listOf(ScreenDestination.BrowseRoot))
    val browseStack = _browseStack.asStateFlow()

    private val _searchStack = MutableStateFlow<List<ScreenDestination>>(listOf(ScreenDestination.SearchRoot))
    val searchStack = _searchStack.asStateFlow()

    private val _savedStack = MutableStateFlow<List<ScreenDestination>>(listOf(ScreenDestination.SavedRoot))
    val savedStack = _savedStack.asStateFlow()

    private val _guideStack = MutableStateFlow<List<ScreenDestination>>(listOf(ScreenDestination.GuideRoot))
    val guideStack = _guideStack.asStateFlow()

    // Search query & focus state
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _focusSearchOnLaunch = MutableStateFlow(false)
    val focusSearchOnLaunch = _focusSearchOnLaunch.asStateFlow()

    // Scroll to top events for tab re-taps
    private val _scrollToTopEvents = MutableSharedFlow<String>()
    val scrollToTopEvents = _scrollToTopEvents.asSharedFlow()

    // Toast message state
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage = _toastMessage.asStateFlow()
    private var toastJob: Job? = null

    // Intro splash state (cold start only)
    var isIntroCompleted = false

    // Browse screen quick search query
    private val _browseSearchQuery = MutableStateFlow("")
    val browseSearchQuery = _browseSearchQuery.asStateFlow()

    // GPS & Nearest Result State
    private val _isLocating = MutableStateFlow(false)
    val isLocating = _isLocating.asStateFlow()

    private val _userLocation = MutableStateFlow<com.example.data.GeoPoint?>(null)
    val userLocation = _userLocation.asStateFlow()

    private val _nearestResults = MutableStateFlow<List<com.example.data.NearestResult>>(emptyList())
    val nearestResults = _nearestResults.asStateFlow()

    // Filtered listings based on city, kash, and browse search
    val currentFilteredListings: StateFlow<List<Listing>> = combine(
        userPreferences,
        _browseSearchQuery
    ) { prefs, browseQuery ->
        val base = listingsRepo.filterListings(prefs.city, prefs.kash)
        if (browseQuery.isBlank()) {
            base
        } else {
            val q = browseQuery.trim().lowercase()
            base.filter { item ->
                item.name.lowercase().contains(q) ||
                item.place.lowercase().contains(q) ||
                item.address.lowercase().contains(q) ||
                item.cats.any { cat ->
                    cat.lowercase().contains(q) ||
                    DirectoryConstants.catName(cat).lowercase().contains(q)
                }
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = listingsRepo.listings
    )

    // Current Search results for Search tab
    val currentSearchResult: StateFlow<SearchResult> = combine(
        _searchQuery,
        userPreferences
    ) { query, prefs ->
        listingsRepo.search(query, prefs.city, prefs.kash)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = SearchResult(emptyList(), emptyList())
    )

    fun setBrowseSearchQuery(query: String) {
        _browseSearchQuery.value = query
        // Reset previously calculated nearest when filter/search changes
        _nearestResults.value = emptyList()
    }

    fun clearBrowseSearchQuery() {
        _browseSearchQuery.value = ""
        _nearestResults.value = emptyList()
    }

    fun dismissNearestResults() {
        _nearestResults.value = emptyList()
    }

    fun calculateClosestToMe(context: Context, onPermissionRequired: () -> Unit) {
        val fineGranted = androidx.core.content.ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        val coarseGranted = androidx.core.content.ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_COARSE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        if (!fineGranted && !coarseGranted) {
            onPermissionRequired()
            return
        }

        haptic(14)
        viewModelScope.launch {
            _isLocating.value = true
            _nearestResults.value = emptyList()
            try {
                val loc = com.example.data.LocationHelper.getCurrentLocation(context)
                if (loc != null) {
                    _userLocation.value = loc
                    val candidates = if (_currentTab.value == "search") {
                        val q = _searchQuery.value.trim()
                        if (q.isNotEmpty()) {
                            currentSearchResult.value.matchingListings
                        } else {
                            listingsRepo.filterListings(userPreferences.value.city, userPreferences.value.kash)
                        }
                    } else {
                        currentFilteredListings.value
                    }
                    if (candidates.isEmpty()) {
                        showToast("No listings match your current filters.")
                    } else {
                        val top5 = com.example.data.LocationHelper.findTopNearest(context, loc, candidates, 5)
                        _nearestResults.value = top5
                        if (top5.isNotEmpty()) {
                            val closest = top5.first()
                            showToast("Closest: ${closest.listing.name} · ${closest.distanceDisplay}")
                        } else {
                            showToast("Could not calculate distances.")
                        }
                    }
                } else {
                    showToast("GPS location unavailable. Please ensure device location is enabled.")
                }
            } catch (e: Exception) {
                showToast("Could not obtain GPS location.")
            } finally {
                _isLocating.value = false
            }
        }
    }

    fun getCurrentStack(): List<ScreenDestination> {
        return when (_currentTab.value) {
            "browse" -> _browseStack.value
            "search" -> _searchStack.value
            "saved" -> _savedStack.value
            "about" -> _guideStack.value
            else -> _browseStack.value
        }
    }

    fun getCurrentDestination(): ScreenDestination {
        val stack = getCurrentStack()
        return stack.lastOrNull() ?: ScreenDestination.BrowseRoot
    }

    fun isAtRoot(): Boolean = getCurrentStack().size <= 1

    fun selectTab(tab: String) {
        haptic(10)
        if (_currentTab.value == tab) {
            val stack = getCurrentStack()
            if (stack.size > 1) {
                // Pop to root
                setStackForTab(tab, stack.take(1))
            } else {
                // Scroll to top
                viewModelScope.launch {
                    _scrollToTopEvents.emit(tab)
                }
            }
        } else {
            _currentTab.value = tab
        }
    }

    fun navigateToDistrict(districtId: String, categoryId: String = "all") {
        haptic(12)
        pushDestination(ScreenDestination.DistrictDest(districtId, categoryId))
    }

    fun navigateToListing(listingId: String) {
        haptic(12)
        pushDestination(ScreenDestination.ListingDest(listingId))
    }

    fun navigateToCategoryInDistrict(categoryId: String) {
        haptic(12)
        val dist = DirectoryConstants.distOfCat(categoryId) ?: return
        // In spec: "opens that category inside its district"
        _currentTab.value = "browse"
        _browseStack.value = listOf(
            ScreenDestination.BrowseRoot,
            ScreenDestination.DistrictDest(dist.id, categoryId)
        )
    }

    fun openSearchFromBrowse() {
        haptic(10)
        _currentTab.value = "search"
        _searchStack.value = listOf(ScreenDestination.SearchRoot)
        _focusSearchOnLaunch.value = true
    }

    fun resetFocusSearch() {
        _focusSearchOnLaunch.value = false
    }

    fun popBack(): Boolean {
        val stack = getCurrentStack()
        if (stack.size > 1) {
            haptic(16)
            setStackForTab(_currentTab.value, stack.dropLast(1))
            return true
        }
        return false
    }

    private fun pushDestination(dest: ScreenDestination) {
        val current = getCurrentStack()
        setStackForTab(_currentTab.value, current + dest)
    }

    private fun setStackForTab(tab: String, newStack: List<ScreenDestination>) {
        when (tab) {
            "browse" -> _browseStack.value = newStack
            "search" -> _searchStack.value = newStack
            "saved" -> _savedStack.value = newStack
            "about" -> _guideStack.value = newStack
        }
    }

    fun setCity(city: String) {
        viewModelScope.launch {
            preferencesRepo.updateCity(city)
        }
    }

    fun toggleKash(kashKey: String) {
        viewModelScope.launch {
            preferencesRepo.toggleKash(kashKey)
        }
    }

    fun clearKash() {
        viewModelScope.launch {
            preferencesRepo.clearKash()
        }
    }

    fun setView(view: String) {
        viewModelScope.launch {
            preferencesRepo.updateView(view)
        }
    }

    fun toggleSave(listingId: String) {
        haptic(14)
        viewModelScope.launch {
            val isNowSaved = preferencesRepo.toggleSave(listingId)
            showToast(if (isNowSaved) "Saved on this device" else "Removed from Saved")
        }
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        _nearestResults.value = emptyList()
    }

    fun submitSearch(query: String) {
        viewModelScope.launch {
            preferencesRepo.addRecentSearch(query)
        }
    }

    fun clearSearchQuery() {
        _searchQuery.value = ""
        _nearestResults.value = emptyList()
    }

    fun showToast(message: String) {
        toastJob?.cancel()
        _toastMessage.value = message
        toastJob = viewModelScope.launch {
            delay(2200)
            _toastMessage.value = null
        }
    }

    private fun haptic(ms: Long) {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getApplication<Application>().getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getApplication<Application>().getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(ms)
            }
        } catch (e: Exception) {
            // Ignore haptic failure gracefully
        }
    }
}
