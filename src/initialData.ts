import { Page } from './types';

export const createId = () => Math.random().toString(36).substring(2, 11);

export const getInitialPages = (userName?: string, goal?: string): Page[] => {
  const welcomeId = 'welcome-page';
  const tipsId = 'quick-tips';
  const roadmapId = 'project-roadmap';
  
  // Database sub-pages (items)
  const task1Id = 'task-launch';
  const task2Id = 'task-bug';
  const task3Id = 'task-docs';

  const personalId = 'personal-space';
  const journalId = 'daily-journal';
  const groceryId = 'grocery-list';

  return [
    {
      id: welcomeId,
      title: userName ? `Welcome, ${userName}! 🌸` : 'Welcome to Zen 🌸',
      icon: '🌸',
      parentId: null,
      isFavorite: true,
      isDatabase: false,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: userName ? `Welcome to Zen, ${userName} 🌸` : 'Welcome to Zen 🌸'
        },
        {
          id: createId(),
          type: 'callout',
          content: 'Zen is a beautiful, minimalist, Notion-like workspace designed to bring peace to your productivity. Keep reading to see what you can do!',
          icon: '✨'
        },
        {
          id: createId(),
          type: 'h2',
          content: 'Key Features of Zen'
        },
        {
          id: createId(),
          type: 'bullet',
          content: '**Block-Based Editor**: Press `Enter` to create a new block, or click on a block to edit its contents.'
        },
        {
          id: createId(),
          type: 'bullet',
          content: '**Slash Commands**: Press `/` on any blank line or while typing to trigger the block inserter. Try typing `/todo` or `/code`!'
        },
        {
          id: createId(),
          type: 'bullet',
          content: '**Hierarchical Pages**: Organize your thoughts with nested pages in the sidebar. Simply expand or collapse the hierarchy.'
        },
        {
          id: createId(),
          type: 'bullet',
          content: '**Full Database Views**: Manage tasks, logs, or databases with Table, Kanban Board, and List views.'
        },
        {
          id: createId(),
          type: 'divider',
          content: ''
        },
        {
          id: createId(),
          type: 'h3',
          content: 'Try out this interactive checklist:'
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Create a new page in the sidebar using the `+` button',
          checked: true
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Open the **Project Roadmap 🗺️** page to see Kanban board and Table views',
          checked: false
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Toggle Dark Mode in the sidebar to experience the peaceful pastel palette',
          checked: false
        },
        {
          id: createId(),
          type: 'quote',
          content: '"Simplicity is the ultimate sophistication." — Leonardo da Vinci'
        }
      ],
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3
    },
    {
      id: tipsId,
      title: 'Quick Tips 💡',
      icon: '💡',
      parentId: welcomeId,
      isFavorite: false,
      isDatabase: false,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'Workspace Tips & Shortcuts'
        },
        {
          id: createId(),
          type: 'h2',
          content: 'Markdown Support'
        },
        {
          id: createId(),
          type: 'text',
          content: 'Zen supports inline markdown syntax for formatting your text. Highlight text to see the changes, or just write directly:'
        },
        {
          id: createId(),
          type: 'bullet',
          content: 'Use `**bold**` to write **bold** text.'
        },
        {
          id: createId(),
          type: 'bullet',
          content: 'Use `*italic*` to write *italic* text.'
        },
        {
          id: createId(),
          type: 'bullet',
          content: 'Use `` `inline code` `` to write `inline code` blocks.'
        },
        {
          id: createId(),
          type: 'h2',
          content: 'Code Editor Snippet'
        },
        {
          id: createId(),
          type: 'code',
          content: '// Welcome to the Zen Zen-Code block\nconst welcome = "Happy Coding!";\nconsole.log(welcome);',
          language: 'javascript'
        }
      ],
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2
    },
    {
      id: roadmapId,
      title: 'Project Roadmap 🗺️',
      icon: '🗺️',
      parentId: null,
      isFavorite: true,
      isDatabase: true,
      databaseConfig: {
        properties: [
          {
            id: 'prop-status',
            name: 'Status',
            type: 'status',
            options: ['Backlog', 'In Progress', 'In Review', 'Done']
          },
          {
            id: 'prop-tags',
            name: 'Tags',
            type: 'multi-select',
            options: ['Feature', 'Bug', 'Design', 'Marketing', 'Core']
          },
          {
            id: 'prop-due',
            name: 'Due Date',
            type: 'date'
          },
          {
            id: 'prop-notes',
            name: 'Notes',
            type: 'text'
          }
        ],
        activeView: 'board',
        filters: []
      },
      blocks: [],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5
    },
    {
      id: task1Id,
      title: 'Launch Zen 🚀',
      icon: '🚀',
      parentId: roadmapId,
      isFavorite: false,
      isDatabase: false,
      propertyValues: {
        'prop-status': 'In Progress',
        'prop-tags': ['Feature', 'Core'],
        'prop-due': '2026-07-20',
        'prop-notes': 'Prepare for final launch of the application.'
      },
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'Launch Plan'
        },
        {
          id: createId(),
          type: 'text',
          content: 'This task tracking sub-page contains blocks to coordinate the launch.'
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Verify all database view features',
          checked: true
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Ensure dark/light mode toggle works flawlessly',
          checked: true
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Submit to platform store',
          checked: false
        }
      ],
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4
    },
    {
      id: task2Id,
      title: 'Fix layout bugs 🐛',
      icon: '🐛',
      parentId: roadmapId,
      isFavorite: false,
      isDatabase: false,
      propertyValues: {
        'prop-status': 'Backlog',
        'prop-tags': ['Bug', 'Design'],
        'prop-due': '2026-07-22',
        'prop-notes': 'Check layout spacing on ultra-wide monitors.'
      },
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'Bug details'
        },
        {
          id: createId(),
          type: 'text',
          content: 'Padding in some sub-menus needs adjustment.'
        }
      ],
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4
    },
    {
      id: task3Id,
      title: 'Write user docs 📚',
      icon: '📚',
      parentId: roadmapId,
      isFavorite: false,
      isDatabase: false,
      propertyValues: {
        'prop-status': 'Done',
        'prop-tags': ['Marketing'],
        'prop-due': '2026-07-15',
        'prop-notes': 'Completed early. Published on main site.'
      },
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'User Guide documentation'
        },
        {
          id: createId(),
          type: 'text',
          content: 'All features have been exhaustively documented.'
        }
      ],
      createdAt: Date.now() - 86400000 * 4,
      updatedAt: Date.now() - 86400000 * 4
    },
    {
      id: personalId,
      title: 'Personal Space 🏡',
      icon: '🏡',
      parentId: null,
      isFavorite: false,
      isDatabase: false,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'My Private Space'
        },
        {
          id: createId(),
          type: 'text',
          content: 'Welcome to your private virtual sanctuary. Keep journals, grocery lists, or life goals here.'
        }
      ],
      createdAt: Date.now() - 86400000 * 6,
      updatedAt: Date.now() - 86400000 * 6
    },
    {
      id: journalId,
      title: 'Daily Journal 📓',
      icon: '📓',
      parentId: personalId,
      isFavorite: false,
      isDatabase: false,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'Reflections & Musings'
        },
        {
          id: createId(),
          type: 'quote',
          content: 'Every day is a fresh beginning.'
        },
        {
          id: createId(),
          type: 'text',
          content: 'Today was filled with clear progress. Configured the entire sidebar and nested tree structure.'
        }
      ],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5
    },
    {
      id: groceryId,
      title: 'Grocery List 🛒',
      icon: '🛒',
      parentId: personalId,
      isFavorite: false,
      isDatabase: false,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: 'Weekly Groceries'
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Organic Avocados 🥑',
          checked: true
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Sourdough Bread 🍞',
          checked: false
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Oat Milk 🥛',
          checked: true
        },
        {
          id: createId(),
          type: 'todo',
          content: 'Fresh Lavender 🌸',
          checked: false
        }
      ],
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5
    }
  ];
};
