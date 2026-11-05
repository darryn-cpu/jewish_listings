package com.example.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.json.JSONArray

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "jyp-shopping-dining")

data class UserPreferences(
    val view: String = "cards", // "cards" or "list"
    val city: String = "All",
    val kash: List<String> = emptyList(),
    val savedIds: List<String> = emptyList(),
    val recentSearches: List<String> = emptyList()
)

class UserPreferencesRepository(
    private val context: Context,
    private val validIdsSupplier: () -> Set<String>
) {
    companion object {
        val KEY_VIEW = stringPreferencesKey("view")
        val KEY_CITY = stringPreferencesKey("city")
        val KEY_KASH = stringPreferencesKey("kash")
        val KEY_SAVED = stringPreferencesKey("saved")
        val KEY_RECENT = stringPreferencesKey("recent")
    }

    val userPreferencesFlow: Flow<UserPreferences> = context.dataStore.data.map { prefs ->
        val view = prefs[KEY_VIEW] ?: "cards"
        val rawCity = prefs[KEY_CITY] ?: "All"
        val city = if (DirectoryConstants.CITIES.contains(rawCity)) rawCity else "All"

        val kash = parseStringList(prefs[KEY_KASH]).filter { k ->
            DirectoryConstants.KASH_TAGS.any { it.key == k }
        }

        val validIds = validIdsSupplier()
        val rawSaved = parseStringList(prefs[KEY_SAVED])
        val saved = if (validIds.isNotEmpty()) {
            rawSaved.filter { validIds.contains(it) }
        } else {
            rawSaved
        }

        val recent = parseStringList(prefs[KEY_RECENT]).take(6)

        UserPreferences(
            view = if (view == "list") "list" else "cards",
            city = city,
            kash = kash,
            savedIds = saved,
            recentSearches = recent
        )
    }

    suspend fun updateView(view: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_VIEW] = if (view == "list") "list" else "cards"
        }
    }

    suspend fun updateCity(city: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_CITY] = city
        }
    }

    suspend fun toggleKash(flag: String) {
        context.dataStore.edit { prefs ->
            val current = parseStringList(prefs[KEY_KASH]).toMutableList()
            if (current.contains(flag)) {
                current.remove(flag)
            } else {
                current.add(flag)
            }
            prefs[KEY_KASH] = serializeStringList(current)
        }
    }

    suspend fun clearKash() {
        context.dataStore.edit { prefs ->
            prefs[KEY_KASH] = serializeStringList(emptyList())
        }
    }

    suspend fun toggleSave(id: String): Boolean {
        var isNowSaved = false
        context.dataStore.edit { prefs ->
            val current = parseStringList(prefs[KEY_SAVED]).toMutableList()
            if (current.contains(id)) {
                current.remove(id)
                isNowSaved = false
            } else {
                current.add(id)
                isNowSaved = true
            }
            prefs[KEY_SAVED] = serializeStringList(current)
        }
        return isNowSaved
    }

    suspend fun addRecentSearch(query: String) {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return
        context.dataStore.edit { prefs ->
            val current = parseStringList(prefs[KEY_RECENT])
                .filter { !it.equals(trimmed, ignoreCase = true) }
                .toMutableList()
            current.add(0, trimmed)
            prefs[KEY_RECENT] = serializeStringList(current.take(6))
        }
    }

    private fun parseStringList(raw: String?): List<String> {
        if (raw.isNullOrEmpty()) return emptyList()
        return try {
            val jsonArray = JSONArray(raw)
            val list = mutableListOf<String>()
            for (idx in 0 until jsonArray.length()) {
                list.add(jsonArray.getString(idx))
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun serializeStringList(list: List<String>): String {
        val jsonArray = JSONArray()
        list.forEach { jsonArray.put(it) }
        return jsonArray.toString()
    }
}
