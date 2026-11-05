package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Jewish Food", appName)
  }

  @Test
  fun `test main activity launch`() {
    val controller = org.robolectric.Robolectric.buildActivity(MainActivity::class.java)
    controller.create().start().resume()
  }

  @Test
  fun `test coil svg decoder on generated storefront`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val listing = com.example.data.Listing(
      id = "bagel-zone-599",
      name = "Bagel Zone",
      cats = listOf("Caterer", "Restaurant")
    )
    val svgStr = com.example.ui.components.generateStorefrontSvg(listing)
    val buffer = okio.Buffer().writeUtf8(svgStr)
    val imageSource = coil.decode.ImageSource(buffer, context)
    val options = coil.request.Options(context)
    val decoder = coil.decode.SvgDecoder(imageSource, options)
    kotlinx.coroutines.runBlocking {
      val result = decoder.decode()
      org.junit.Assert.assertNotNull(result)
    }
  }

  @Test
  fun `test listings repository loads all listings from assets`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val repo = com.example.data.ListingsRepository(context)
    val listings = repo.listings
    assertEquals(133, listings.size)
    val first = listings.first()
    org.junit.Assert.assertNotNull(first.name)
    org.junit.Assert.assertTrue(first.name.isNotEmpty())
  }
}

