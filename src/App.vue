<script setup lang="ts">
import { onMounted, reactive } from "vue";

import Game from "./classes/Game";

let game: Game | null = null;

const state = reactive({
  tickNumber: 0,
  running: true,
});

const redraw = () => {
  state.tickNumber++;
};

const tick = () => {
  if (state.running) {
    state.tickNumber++;

    game?.tick();
  }

  requestAnimationFrame(tick);
};

const toggleCellState = (rowIndex: number, colIndex: number) => {
  game?.toggleCellState(rowIndex, colIndex);

  redraw();
};

onMounted(() => {
  game = new Game(50, 100);

  tick();
});
</script>

<template>
  <div class="container mx-auto text-center px-4 py-20">
    <div class="mb-20 flex items-center justify-center gap-4">
      <button
        class="bg-neutral-200 px-4 py-2 rounded-lg cursor-pointer"
        @click="state.running = !state.running"
      >
        {{ state.running ? "Pause" : "Resume" }}
      </button>

      <div class="border rounded-lg inline-block py-2 px-4 border-neutral-200">
        {{ state.tickNumber }}
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
        ></div>
      </div>
    </div>
  </div>
</template>
