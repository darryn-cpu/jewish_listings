package com.example.data

import android.content.Context
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

data class SearchResult(
    val matchingCategories: List<String>,
    val matchingListings: List<Listing>
)

class ListingsRepository(private val context: Context) {
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    val listings: List<Listing> by lazy {
        loadListings()
    }

    private fun loadListings(): List<Listing> {
        return try {
            val jsonString = context.assets.open("listings.json").bufferedReader().use { it.readText() }
            val listType = Types.newParameterizedType(List::class.java, Listing::class.java)
            val adapter = moshi.adapter<List<Listing>>(listType)
            adapter.fromJson(jsonString) ?: emptyList()
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    fun getListingById(id: String): Listing? {
        return listings.firstOrNull { it.id == id }
    }

    fun filterListings(city: String, kash: List<String>): List<Listing> {
        return listings.filter { b ->
            val inCity = city == "All" || b.city == city
            val matchKash = kash.all { k ->
                when (k) {
                    "m" -> b.k.m
                    "d" -> b.k.d
                    "c" -> b.k.c
                    "p" -> b.k.p
                    "h" -> b.k.h
                    else -> true
                }
            }
            inCity && matchKash
        }
    }

    fun search(query: String, city: String, kash: List<String>): SearchResult {
        val q = query.trim()
        if (q.isEmpty()) {
            return SearchResult(emptyList(), emptyList())
        }
        val tokens = q.lowercase().split("\\s+".toRegex()).filter { it.isNotEmpty() }
        fun matches(text: String): Boolean = tokens.all { text.contains(it) }

        // Category hits
        val allCategories = listings.flatMap { it.cats }.distinct()
        val matchingCats = allCategories.filter { id ->
            val combined = "$id ${DirectoryConstants.catName(id)}".lowercase()
            matches(combined)
        }

        // Business hits
        val matchingBiz = filterListings(city, kash).filter { b ->
            val hay = listOf(
                b.name,
                b.cats.joinToString(" "),
                b.cats.joinToString(" ") { DirectoryConstants.catName(it) },
                b.address,
                b.place,
                b.city,
                DirectoryConstants.cityLabel(b.city),
                b.notes,
                b.line,
                b.desc ?: "",
                if (b.k.p) "parev" else "",
                if (b.k.d) "dairy" else "",
                if (b.k.c) "chalav yisrael chalav" else "",
                if (b.k.m) "meat" else "",
                if (b.k.h) "mehadrin" else ""
            ).joinToString(" ").lowercase()
            matches(hay)
        }.sortedBy { it.name }

        return SearchResult(matchingCats, matchingBiz)
    }
}
