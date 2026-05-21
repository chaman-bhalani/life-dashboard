import type { AppState, Task, Habit, MoodEntry } from './types';
import {
  format, subDays, subWeeks, addDays, startOfWeek, isToday,
  isBefore, startOfDay
} from 'date-fns';

function randomId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomDate(daysBack: number): string {
  const d = subDays(new Date(), Math.floor(Math.random() * daysBack));
  return format(d, 'yyyy-MM-dd');
}

function futureDate(daysAhead: number): string {
  const d = addDays(new Date(), Math.floor(Math.random() * daysAhead));
  return format(d, 'yyyy-MM-dd');
}

const categories = ['Work', 'Personal', 'Health', 'Learning', 'Finance'] as const;
const priorities = ['low', 'medium', 'high'] as const;
const statuses = ['todo', 'in-progress', 'completed'] as const;

const taskTemplates = [
  { title: 'Review Q2 budget report', desc: 'Go through the quarterly budget allocations and flag any discrepancies', cat: 'Work' as const, est: 45 },
  { title: 'Prepare team standup notes', desc: 'Summarize progress from the last sprint for Monday standup', cat: 'Work' as const, est: 15 },
  { title: 'Update project documentation', desc: 'Add new API endpoints to the project wiki', cat: 'Work' as const, est: 60 },
  { title: 'Client presentation slides', desc: 'Create slides for the upcoming client demo on product features', cat: 'Work' as const, est: 90 },
  { title: 'Code review: auth module', desc: 'Review the pull request for the new authentication module', cat: 'Work' as const, est: 30 },
  { title: 'Deploy staging build', desc: 'Push latest changes to staging environment and run smoke tests', cat: 'Work' as const, est: 20 },
  { title: 'Morning jog - 5K', desc: 'Run along the park trail, target pace 5:30/km', cat: 'Health' as const, est: 35 },
  { title: 'Meal prep for the week', desc: 'Cook chicken, rice, and veggies for weekday lunches', cat: 'Health' as const, est: 120 },
  { title: 'Book annual health checkup', desc: 'Schedule appointment with Dr. Patel for annual physical', cat: 'Health' as const, est: 10 },
  { title: 'Yoga session', desc: '30-minute flow focusing on flexibility and breathing', cat: 'Health' as const, est: 30 },
  { title: 'Read "Atomic Habits"', desc: 'Finish chapters 5-7 and take notes on habit stacking', cat: 'Learning' as const, est: 45 },
  { title: 'Complete TypeScript course', desc: 'Watch modules 8-10 on advanced generics and utility types', cat: 'Learning' as const, est: 60 },
  { title: 'Practice piano - Chopin', desc: 'Work on Nocturne Op. 9 No. 2 - focus on the middle section', cat: 'Learning' as const, est: 40 },
  { title: 'Grocery shopping', desc: 'Buy vegetables, fruits, dairy, and pantry staples', cat: 'Personal' as const, est: 45 },
  { title: 'Call Mom', desc: 'Weekly catch-up call, ask about the garden renovation', cat: 'Personal' as const, est: 30 },
  { title: 'Organize closet', desc: 'Sort through winter clothes and donate items no longer needed', cat: 'Personal' as const, est: 60 },
  { title: 'Plan weekend trip', desc: 'Research hiking trails and book accommodation for the weekend', cat: 'Personal' as const, est: 30 },
  { title: 'Pay electricity bill', desc: 'Online payment for this month\'s utility bill', cat: 'Finance' as const, est: 5 },
  { title: 'Review investment portfolio', desc: 'Check stock performance and rebalance if needed', cat: 'Finance' as const, est: 30 },
  { title: 'Set up emergency fund', desc: 'Transfer savings to high-yield account for emergency reserves', cat: 'Finance' as const, est: 15 },
];

function generateMockTasks(): Task[] {
  const tasks: Task[] = [];
  const today = format(new Date(), 'yyyy-MM-dd');

  taskTemplates.forEach((template, i) => {
    const statusIdx = i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 0;
    const status = statuses[statusIdx];
    const priority = priorities[i % 3];
    
    let dueDate: string;
    if (status === 'completed') {
      dueDate = randomDate(14);
    } else if (i % 5 === 0) {
      dueDate = format(subDays(new Date(), Math.floor(Math.random() * 3) + 1), 'yyyy-MM-dd'); // overdue
    } else if (i % 4 === 0) {
      dueDate = today; // due today
    } else {
      dueDate = futureDate(7); // this week
    }

    const createdAt = format(subDays(new Date(), Math.floor(Math.random() * 30) + 5), 'yyyy-MM-dd\'T\'HH:mm:ss');
    const completedAt = status === 'completed' 
      ? format(subDays(new Date(), Math.floor(Math.random() * 7)), 'yyyy-MM-dd\'T\'HH:mm:ss')
      : undefined;

    tasks.push({
      id: randomId(),
      title: template.title,
      description: template.desc,
      priority,
      dueDate,
      estimatedTime: template.est,
      status,
      category: template.cat,
      createdAt,
      completedAt,
    });
  });

  return tasks;
}

function generateHeatmapData(): Record<string, number> {
  const data: Record<string, number> = {};
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const rand = Math.random();
    if (rand > 0.3) {
      // weight towards lower counts with occasional spikes
      if (rand > 0.9) data[date] = Math.floor(Math.random() * 3) + 4; // 4-6
      else if (rand > 0.7) data[date] = Math.floor(Math.random() * 2) + 2; // 2-3
      else data[date] = 1;
    }
    // ~30% of days have 0 tasks
  }

  return data;
}

function generateMockHabits(): Habit[] {
  const habits: Habit[] = [
    { id: randomId(), name: 'Drink Water', icon: 'Droplets', completions: {} },
    { id: randomId(), name: 'Meditate', icon: 'Brain', completions: {} },
    { id: randomId(), name: 'Read 30 min', icon: 'BookOpen', completions: {} },
    { id: randomId(), name: 'Exercise', icon: 'Dumbbell', completions: {} },
    { id: randomId(), name: 'Journal', icon: 'PenLine', completions: {} },
  ];

  // Fill in the last 14 days with realistic completions
  const today = new Date();
  habits.forEach((habit) => {
    for (let i = 0; i < 14; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      // ~65% chance of completion, decreasing slightly for older days
      habit.completions[date] = Math.random() > (0.35 + i * 0.01);
    }
  });

  return habits;
}

function generateMockMoods(): MoodEntry[] {
  const moods: MoodEntry[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    // weighted towards happier moods
    const rand = Math.random();
    let level: 1 | 2 | 3 | 4 | 5;
    if (rand > 0.85) level = 5;
    else if (rand > 0.55) level = 4;
    else if (rand > 0.25) level = 3;
    else if (rand > 0.1) level = 2;
    else level = 1;
    moods.push({ date, level });
  }

  return moods;
}

export function generateInitialState(): AppState {
  return {
    theme: 'dark',
    activeSection: 'dashboard',
    taskViewMode: 'list',
    tasks: generateMockTasks(),
    habits: generateMockHabits(),
    moods: generateMockMoods(),
    scratchpad: `## Quick Notes ✨\n\n- Follow up with Sarah about the design review\n- Research vacation spots for August\n- Remember to water the plants 🌱\n- New podcast recommendation: "Deep Work" episodes\n\n### Ideas\n- Build a reading list tracker\n- Try the new coffee shop on Main St`,
    sidebarCollapsed: false,
  };
}

// Pre-computed heatmap data stored separately (not in main state to keep it lean)
export const heatmapData = generateHeatmapData();
