import { computed, ref, watch } from 'vue'

import { useIntervalFn, useStorage } from '@vueuse/core'

import { useTimerStore } from '@/store'

import drawCircle from './favicons'

const useTimer = () => {
  const timerStore = useTimerStore()

  const currDuration = timerStore.timerMap[timerStore.timerType].duration

  const { pause, resume, isActive } = useIntervalFn(
    () => {
      if (--timerStore.timer <= 0) {
        timerStore.timer = 0
        nextTimer()
      }
      renderFavicon()
    },
    1000,
    { immediate: false }
  )

  const renderFavicon = () => {
    const favicon = document.getElementById('favicon')

    if (favicon) {
      favicon.href = drawCircle(timerStore.percentage, {
        backgroundLine: true,
        strokeWidth: 10
      })
    }
  }

  const nextTimer = () => {
    if (timerStore.timerType === 'pomodoro') {
      timerStore.sessions++

      if (timerStore.pomodoros < 4) {
        initTimer('shortBreak')
      } else {
        initTimer('longBreak')
      }
    } else {
      if (timerStore.pomodoros === 4) {
        timerStore.pomodoros = 1
      } else {
        timerStore.pomodoros++
      }
      initTimer('pomodoro')
    }
  }

  const timerToTime = computed(() => {
    let minutes
    let seconds
    minutes = parseInt((timerStore.timer / 60).toString(), 10)
    seconds = parseInt((timerStore.timer % 60).toString(), 10)
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    if (timerStore.showSeconds) return minutes + ':' + seconds

    // if minutes = 0 but seconds > 0, display minutes = 1
    return parseInt(seconds.toString()) !== 0 &&
      parseInt(minutes.toString()) === 0
      ? '01'
      : minutes
  })

  const initTimer = (type: string) => {
    timerStore.timerType = type
    if (timerStore.auto) {
      resume()
    }
  }

  const start = () => {
    timerStore.timer = timerStore.timerMap[timerStore.timerType].duration
    resume()
  }

  const reset = () => {
    timerStore.pomodoros = 1
    timerStore.sessions = 0
    timerStore.timerType = 'pomodoro'
    timerStore.timer = timerStore.timerMap[timerStore.timerType].duration
  }

  watch(timerStore, () => {
    timerStore.timer = timerStore.timerMap[timerStore.timerType].duration
    const duration = timerStore.timerMap[timerStore.timerType].duration
    timerStore.percentage = Math.floor(
      ((timerStore.timer || duration) / duration) * 100
    )
  })

  return {
    timerToTime,
    pause,
    resume,
    start,
    reset,
    isActive,
    initTimer
  }
}

export default useTimer
