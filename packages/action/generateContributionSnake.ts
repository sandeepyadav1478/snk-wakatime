import { getGithubUserContribution } from "@snk/github-user-contribution";
import { userContributionToGrid } from "./userContributionToGrid";
import { getBestRoute } from "@snk/solver/getBestRoute";
import { snake4 } from "@snk/types/__fixtures__/snake";
import { getPathToPose } from "@snk/solver/getPathToPose";
import type { DrawOptions as DrawOptions } from "@snk/svg-creator";
import type { AnimationOptions } from "@snk/gif-creator";

// Helper function to fetch and convert WakaTime data
const getWakaTimeContribution = async (wakatimeUrl: string) => {
  console.log("📊 fetching WakaTime data");

  const response = await fetch(wakatimeUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch WakaTime data: ${response.statusText}`);
  }

  const wakatimeData = await response.json();
  console.log(`✓ Got ${wakatimeData.days?.length || 0} days from WakaTime`);

  // Convert WakaTime data to cell format
  const dateMap: Record<string, { hours: number; level: number }> = {};

  for (const day of wakatimeData.days || []) {
    const hours = (day.total || 0) / 3600;
    let level = 0;

    if (hours >= 5) level = 4;
    else if (hours >= 3) level = 3;
    else if (hours >= 1) level = 2;
    else if (hours > 0) level = 1;

    dateMap[day.date] = { hours, level };
  }

  // Generate cells in snk format (52 weeks × 7 days)
  const cells: Array<{
    x: number;
    y: number;
    date: string;
    count: number;
    level: number;
  }> = [];

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 363); // 52 weeks

  // Adjust start to Sunday
  const dayOfWeek = startDate.getDay();
  if (dayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - dayOfWeek);
  }

  let weekIndex = 0;
  let currentDate = new Date(startDate);

  while (weekIndex < 53) {
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const data = dateMap[dateStr] || { hours: 0, level: 0 };

      cells.push({
        x: weekIndex,
        y: dayOfWeek,
        date: dateStr,
        count: Math.round(data.hours * 5), // Convert hours to contribution count
        level: data.level,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    weekIndex++;
  }

  console.log(
    `✓ Generated ${cells.length} cells, ${Object.keys(dateMap).length} coding days`,
  );
  return cells;
};

export const generateContributionSnake = async (
  userName: string,
  outputs: ({
    format: "svg" | "gif";
    drawOptions: DrawOptions;
    animationOptions: AnimationOptions;
  } | null)[],
  options: { githubToken: string; wakatimeUrl?: string },
) => {
  let cells;

  // Check if WakaTime URL is provided
  if (options.wakatimeUrl) {
    try {
      cells = await getWakaTimeContribution(options.wakatimeUrl);
    } catch (error) {
      console.error(
        "⚠️ Failed to fetch WakaTime data, falling back to GitHub:",
        error,
      );
      console.log("🎣 fetching github user contribution");
      cells = await getGithubUserContribution(userName, options);
    }
  } else {
    console.log("🎣 fetching github user contribution");
    cells = await getGithubUserContribution(userName, options);
  }

  const grid = userContributionToGrid(cells);
  const snake = snake4;

  console.log("📡 computing best route");
  const chain = getBestRoute(grid, snake)!;
  chain.push(...getPathToPose(chain.slice(-1)[0], snake)!);

  return Promise.all(
    outputs.map(async (out, i) => {
      if (!out) return;
      const { format, drawOptions, animationOptions } = out;
      switch (format) {
        case "svg": {
          console.log(`🖌 creating svg (outputs[${i}])`);
          const { createSvg } = await import("@snk/svg-creator");
          return createSvg(grid, cells, chain, drawOptions, animationOptions);
        }
        case "gif": {
          console.log(`📹 creating gif (outputs[${i}])`);
          const { createGif } = await import("@snk/gif-creator");
          return await createGif(
            grid,
            cells,
            chain,
            drawOptions,
            animationOptions,
          );
        }
      }
    }),
  );
};
