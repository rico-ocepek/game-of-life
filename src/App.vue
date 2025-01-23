<script setup lang="ts">
import { onMounted, reactive } from "vue";

import Game, { type AvailablePresets } from "./classes/Game";

let game: Game | null = null;

const state = reactive<{
  tickNumber: number;
  running: boolean;
  selectedPreset: AvailablePresets | null;
  presetOptions: AvailablePresets[];
}>({
  tickNumber: 0,
  running: true,
  selectedPreset: null,
  presetOptions: [
    "glider",
    "glider-gun",
    "blinker",
    "pentadecathlon",
    "symmetrical-oscillator",
  ],
});

const redraw = () => {
  state.tickNumber++;
};

const tick = () => {
  if (state.running) {
    state.tickNumber++;

    game?.tick();
  }

  setTimeout(tick, 100);
};

const toggleCellState = (rowIndex: number, colIndex: number) => {
  game?.toggleCellState(rowIndex, colIndex);

  redraw();
};

const selectPreset = () => {
  if (!state.selectedPreset) return;

  game?.loadPreset(state.selectedPreset);

  state.selectedPreset = null;

  redraw();
};

onMounted(() => {
  game = new Game(50, 100);

  tick();
});
</script>

<template>
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
        class="bg-neutral-200 px-4 py-2 rounded-lg cursor-pointer"
        @click="state.running = !state.running"
      >
        {{ state.running ? "Pause" : "Resume" }}
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
        class="cursor-pointer rounded aspect-square flex-grow"
        :class="cellState ? 'bg-neutral-700 text-white' : 'bg-neutral-200'"
        @click="toggleCellState(rowIndex, colIndex)"
      >
        <!-- {{ rowIndex }} / {{ colIndex }} -->
      </div>
    </div>
  </div>
</template>
