package com.chrisrey91.arcontrol.live

/**
 * Represents the various phases of the application's boot sequence.
 * Each phase has a user-facing message.
 */
enum class BootPhase(val message: String) {
    CORE_BOOT("CORE BOOT"),
    AUDIO_DSP("AUDIO DSP HARDENING"),
    VIDEO_ENGINE("VIDEO ENGINE SYNC"),
    AI_COPILOT("AI COPILOT VALIDATION")
}

/**
 * A sealed class representing the possible states of the boot process.
 * This allows for exhaustive state handling in the UI.
 */
sealed class BootState {
    /**
     * The application is currently initializing.
     * @property progress The overall progress from 0 to 100.
     * @property phase The current [BootPhase] being executed.
     */
    data class Loading(val progress: Int, val phase: BootPhase) : BootState()

    /**
     * An error occurred during the boot process.
     * @property message A message describing the error.
     * @property canRetry Whether the user can attempt to retry the boot process.
     */
    data class Error(val message: String, val canRetry: Boolean) : BootState()

    /**
     * The application has finished booting and is ready to navigate to the main dashboard.
     */
    object Ready : BootState()
}
