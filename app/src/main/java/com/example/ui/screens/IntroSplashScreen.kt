package com.example.ui.screens

import android.content.Context
import android.graphics.Matrix
import android.graphics.SurfaceTexture
import android.media.MediaPlayer
import android.net.Uri
import android.view.TextureView
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.R
import kotlinx.coroutines.delay

@Composable
fun IntroSplashScreen(
    onDismissed: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isVisible by remember { mutableStateOf(true) }
    var showTapToPlay by remember { mutableStateOf(false) }
    var isStarted by remember { mutableStateOf(false) }
    var mediaPlayerRef by remember { mutableStateOf<MediaPlayer?>(null) }

    val alpha by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0f,
        animationSpec = tween(450),
        label = "splashAlpha"
    )

    fun finish() {
        if (!isVisible) return
        isVisible = false
    }

    fun finishImmediately() {
        isVisible = false
        onDismissed()
    }

    LaunchedEffect(alpha, isVisible) {
        if (!isVisible && alpha <= 0.01f) {
            onDismissed()
        }
    }

    // Safety timeout in case playback does not start within 2 seconds
    LaunchedEffect(Unit) {
        delay(2000)
        if (!isStarted) {
            showTapToPlay = true
        }
        delay(6500) // max video length ~6s
        finish()
    }

    // Release player when Composable leaves composition
    DisposableEffect(Unit) {
        onDispose {
            try {
                mediaPlayerRef?.stop()
                mediaPlayerRef?.release()
                mediaPlayerRef = null
            } catch (_: Exception) {}
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .alpha(alpha)
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            factory = { ctx ->
                val textureView = TextureView(ctx)
                textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                    override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                        try {
                            val mp = MediaPlayer().apply {
                                val uri = Uri.parse("android.resource://${ctx.packageName}/${R.raw.intro}")
                                setDataSource(ctx, uri)
                                setSurface(android.view.Surface(surface))
                                setVolume(0f, 0f) // No sound, muted
                                isLooping = false

                                setOnVideoSizeChangedListener { _, vw, vh ->
                                    adjustAspectRatio(textureView, vw, vh)
                                }

                                setOnPreparedListener { player ->
                                    adjustAspectRatio(textureView, player.videoWidth, player.videoHeight)
                                    isStarted = true
                                    showTapToPlay = false
                                    player.start()
                                }

                                setOnCompletionListener {
                                    finish()
                                }

                                setOnErrorListener { _, _, _ ->
                                    finishImmediately()
                                    true
                                }

                                prepareAsync()
                            }
                            mediaPlayerRef = mp
                        } catch (e: Exception) {
                            finishImmediately()
                        }
                    }

                    override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {
                        mediaPlayerRef?.let { mp ->
                            adjustAspectRatio(textureView, mp.videoWidth, mp.videoHeight)
                        }
                    }

                    override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
                        try {
                            mediaPlayerRef?.stop()
                            mediaPlayerRef?.release()
                            mediaPlayerRef = null
                        } catch (_: Exception) {}
                        return true
                    }

                    override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
                }
                textureView
            },
            modifier = Modifier.fillMaxSize()
        )

        if (showTapToPlay) {
            Text(
                text = "Tap to play",
                color = Color(0xFFFFB15A),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.02.sp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 120.dp)
                    .clickable {
                        showTapToPlay = false
                        try {
                            mediaPlayerRef?.start()
                            isStarted = true
                        } catch (e: Exception) {
                            finishImmediately()
                        }
                    }
                    .padding(14.dp)
            )
        }
    }
}

private fun adjustAspectRatio(textureView: TextureView, videoWidth: Int, videoHeight: Int) {
    if (videoWidth <= 0 || videoHeight <= 0) return
    val viewWidth = textureView.width.toFloat()
    val viewHeight = textureView.height.toFloat()
    if (viewWidth <= 0 || viewHeight <= 0) return

    val videoAspect = videoWidth.toFloat() / videoHeight.toFloat()
    val viewAspect = viewWidth / viewHeight

    val scaleX: Float
    val scaleY: Float

    // Contained (letterbox or pillarbox) without cropping
    if (videoAspect > viewAspect) {
        scaleX = 1f
        scaleY = (viewWidth / videoAspect) / viewHeight
    } else {
        scaleX = (viewHeight * videoAspect) / viewWidth
        scaleY = 1f
    }

    val matrix = Matrix()
    matrix.setScale(scaleX, scaleY, viewWidth / 2f, viewHeight / 2f)
    textureView.setTransform(matrix)
}
