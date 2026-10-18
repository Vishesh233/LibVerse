/**
 * ECharts with only what the app draws: bar, line and pie charts on a canvas, with grid, tooltip
 * and legend (plain and scroll). Add a chart type or component here before using it in an option.
 */
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export { echarts };
