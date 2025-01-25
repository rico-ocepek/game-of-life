<script setup lang="ts">
import { onMounted, reactive } from "vue";

import Game, { type AvailablePresets } from "./classes/Game";

import IconsBackward from "./components/icons/Backward.vue";
import IconsForward from "./components/icons/Forward.vue";
import IconsPause from "./components/icons/Pause.vue";
import IconsPlay from "./components/icons/Play.vue";

let game: Game | null = null;

const state = reactive<{
  tickNumber: number;
  running: boolean;
  selectedPreset: AvailablePresets | null;
  timeout: number;
  presetOptions: AvailablePresets[];
}>({
  tickNumber: 0,
  running: false,
  selectedPreset: null,
  timeout: 50,
  presetOptions: [
    "glider",
    "glider-gun",
    "glider-army",
    "blinker",
    "pentadecathlon",
    "symmetrical-oscillator",
  ],
});

const canUntick = () => {
  return game?.canUntick();
};

const redraw = () => {
  // this is not really a "tick" but the only way to re-render currently
  state.tickNumber++;
};

const tick = () => {
  state.tickNumber++;

  game?.tick();
};

const untick = () => {
  state.tickNumber--;

  game?.untick();
};

const autoTick = () => {
  if (!state.running) {
    return;
  }

  tick();

  setTimeout(autoTick, state.timeout);
};

const toggleRunning = () => {
  state.running = !state.running;

  if (state.running) {
    autoTick();
  }
};

const toggleCellState = (rowIndex: number, colIndex: number) => {
  game?.toggleCellState(rowIndex, colIndex);

  redraw();
};

const selectPreset = () => {
  if (!state.selectedPreset) return;

  game?.loadPreset(state.selectedPreset);

  state.selectedPreset = null;
};

onMounted(() => {
  game = new Game(80, 100);

  tick();
});
</script>

<template>
  <div
    class="fixed border px-4 py-2 rounded-lg border-neutral-400 bottom-4 left-4 bg-white/40"
  >
    <h1 class="text-xl font-bold">Debug info</h1>

    <p>Tick: {{ state.tickNumber }}</p>

    <p>Fields: {{ (game?.rowCount ?? 0) * (game?.colCount ?? 0) }}</p>

    <p>Updated fields: {{ game?._updatedCells.length }}</p>

    <p>
      Updated:
      {{
        (
          ((game?._updatedCells.length ?? 0) /
            ((game?.rowCount ?? 1) * (game?.colCount ?? 1))) *
          100
        ).toPrecision(2)
      }}
      %
    </p>

    <p>History length: {{ game?._history.length }}</p>

    <p>History cursor position: {{ game?._historyCursorPosition }}</p>

    <p>
      Last history entry for 0/0:

      {{
        game?._history[game?._history.length - 1]?.cellStates[0][0]
          ? "true"
          : "false"
      }}
    </p>
  </div>

  <div class="container mx-auto text-center px-4 pt-20 pb-10">
    <div class="flex items-center justify-center gap-4">
      <select
        class="border-neutral-200 outline-none border cursor-pointer px-4 py-2 rounded-lg appearance-none"
        v-model="state.selectedPreset"
        @change="selectPreset"
      >
        <option disabled :value="null">Preset</option>

        <option
          v-for="option in state.presetOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>

      <button
        class="bg-neutral-200 px-4 py-2 rounded-lg cursor-pointer active:bg-neutral-300"
        :class="canUntick() ? '' : 'opacity-50'"
        @click="untick"
      >
        <IconsBackward />
      </button>

      <button
        class="bg-neutral-200 px-4 py-2 rounded-lg cursor-pointer active:bg-neutral-300"
        @click="toggleRunning"
      >
        <IconsPause v-if="state.running" />
        <IconsPlay v-else />
      </button>

      <button
        class="bg-neutral-200 px-4 py-2 rounded-lg cursor-pointer active:bg-neutral-300"
        @click="tick"
      >
        <IconsForward />
      </button>
    </div>
  </div>

  <div :key="state.tickNumber" class="flex flex-col gap-y-0.5">
    <div
      v-for="(row, rowIndex) in game?.cellStates"
      class="flex flex-grow gap-x-0.5"
    >
      <div
        v-for="(cellState, colIndex) in row"
        class="cursor-pointer rounded-xs aspect-square flex-grow"
        :class="cellState ? 'bg-neutral-700 text-white' : 'bg-neutral-200'"
        @click="toggleCellState(rowIndex, colIndex)"
      >
        <!-- {{ rowIndex }} / {{ colIndex }} -->
      </div>
    </div>
  </div>
</template>
