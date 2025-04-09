src/
├── components/
│   ├── ui/
│   │   ├── profiledropdown.jsx           # Reusable UI components (includes shadcn + custom components)
│   │   ├── button.jsx
│   │   ├── blogposttable.jsx
│   │   └── ...
│   ├── pages/
│       ├── Blogger/           # Page-specific components
│       │   ├── BloggerHome.jsx
│       │   ├── BloggerLanding.jsx
|       |   └── BloggerProfile.jsx
│       ├── Editor/
│       │   ├── CreateEditorPreview.jsx
│       │   └── PublishEditorPreview.jsx
│       └── ...
|
├── contexts/
│   ├── AuthContext.js          # State management contexts
|
├── hooks/
│   ├── use-blogdata.js         # Custom React hooks (also includes shadcn hooks)
│   ├── use-bloglist.js
│   └── use-profiledata.js
|
├── lib/
│   ├── utils.js             
|
├── config/
│   ├── api.js  # API configuration
|
└── constants/
    ├── blogTableStaticcols.jsx   # UI Scheme Constant
    └── mdtemplate.jsx            # Content Template Constant


├── public/
│   ├── vite.svg             # Static assets
│   └── assets/