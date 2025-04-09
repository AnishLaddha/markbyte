```
src/
├── components/
│   ├── ui/                            # Reusable UI components (includes shadcn + custom components)
│   │   ├── profiledropdown.jsx
│   │   ├── button.jsx
│   │   ├── blogposttable.jsx
│   │   └── ...
│   ├── pages/                         # Page-specific components
│       ├── Blogger/
│       │   ├── BloggerHome.jsx
│       │   ├── BloggerLanding.jsx
│       │   └── BloggerProfile.jsx
│       ├── Editor/
│       │   ├── CreateEditorPreview.jsx
│       │   └── PublishEditorPreview.jsx
│       └── ...
├── contexts/
│   ├── AuthContext.js                 # State management contexts
|
├── hooks/                             # Custom React hooks (also includes shadcn hooks)
│   ├── use-blogdata.js
│   ├── use-bloglist.js
│   └── use-profiledata.js
|
├── services/                          # Application logic for interacting with APIs and encapsulating reusable service functions
│   ├── authService.jsx
│   ├── blogService.jsx
│   └── userService.jsx
|
├── lib/
│   ├── utils.js                       # ShadCN provided
|
├── config/
│   ├── api.js                         # API configuration
|
├── constants/
│   ├── blogTableStaticcols.jsx        # UI Schema Constant
│   └── mdtemplate.jsx                 # Content Template Constant
| 
├── public/
│   ├── vite.svg                       # Static assets
│   └── assets/
```