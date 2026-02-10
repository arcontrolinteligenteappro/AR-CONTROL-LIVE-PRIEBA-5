package com.chrisrey91.arcontrol.live

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SplashViewModel : ViewModel() {

    private val _bootState = MutableStateFlow<BootState>(BootState.Loading(0, BootPhase.CORE_BOOT))
    val bootState = _bootState.asStateFlow()

    init {
        startBootProcess()
    }

    fun startBootProcess(isRetry: Boolean = false) {
        viewModelScope.launch {
            try {
                if (isRetry) {
                     // Reset progress on retry
                    _bootState.value = BootState.Loading(0, BootPhase.CORE_BOOT)
                    delay(500)
                }

                val phases = BootPhase.values()
                val totalPhases = phases.size
                var overallProgress = 0

                phases.forEachIndexed { index, phase ->
                    val phaseDuration = when (phase) {
                        BootPhase.CORE_BOOT -> 1200L
                        BootPhase.AUDIO_DSP -> 1500L
                        BootPhase.VIDEO_ENGINE -> 1800L
                        BootPhase.AI_COPILOT -> 2000L
                    }
                    val progressSteps = 25
                    val stepDelay = phaseDuration / progressSteps

                    // Simulate progress for the current phase
                    for (i in 1..progressSteps) {
                        overallProgress = (index * 25) + i
                        _bootState.value = BootState.Loading(overallProgress, phase)
                        delay(stepDelay)
                    }

                    // Simulate a recoverable error for demonstration
                    if (phase == BootPhase.VIDEO_ENGINE && !isRetry) {
                        // For a real app, you might want to uncomment a line like this to test error handling:
                        // throw IllegalStateException("Video subsystem sync failed. Retrying...")
                    }
                }
                
                // Final state after all phases complete
                _bootState.value = BootState.Loading(100, phases.last())
                delay(300) // Brief pause on 100%
                _bootState.value = BootState.Ready

            } catch (e: Exception) {
                _bootState.value = BootState.Error(e.message ?: "Unknown error", true)
            }
        }
    }
}
