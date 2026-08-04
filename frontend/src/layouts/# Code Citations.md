# Code Citations

## License: unknown
https://github.com/Rishav0809/Community-Feed/blob/f69e7b5df4c243e4ca3d1c5743d54b6d4895e91e/backend/models/user.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new
```


## License: unknown
https://github.com/Rishav0809/Community-Feed/blob/f69e7b5df4c243e4ca3d1c5743d54b6d4895e91e/backend/models/user.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    passwor
```


## License: unknown
https://github.com/Rishav0809/Community-Feed/blob/f69e7b5df4c243e4ca3d1c5743d54b6d4895e91e/backend/models/user.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      
```


## License: unknown
https://github.com/Abhishek-723/test-repo/blob/813ebd42681342bbe3f23d7cc5bdb86eb760984f/Models/userModel.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

//
```


## License: unknown
https://github.com/jeetu16/shoping-now/blob/d2eb5573ac39d25f842029a1bc2e90369de52b43/backend/src/models/userSchema.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

//
```


## License: unknown
https://github.com/smperilla/bookapp-backend/blob/d3cc9ac97f0e88b430689794ce7d3fd15e5882ff/Models/User.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

//
```


## License: unknown
https://github.com/mohT4/Product-Manager/blob/bf3774914d17badf7a0e70bce0f0377619b87608/models/user.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

//
```


## License: unknown
https://github.com/aditokmoo/MERN-E-commerce/blob/ce6aed99a7f4c436b591cf46c180ca778fdfa8a9/backend/models/User.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

//
```


## License: unknown
https://github.com/imran-shuvo/BookShelf-API/blob/841822a0b874b213f49bb279eddced380f085881/src/models/book.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');
```


## License: unknown
https://github.com/prasad323/project/blob/3c722f9ad249c55edd012063108ca96b83938b8a/index.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req,
```


## License: unknown
https://github.com/shamapumbu/budgetApp/blob/77ab4695a79413fcf15fb9cf62cf1791f50a74b0/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req,
```


## License: unknown
https://github.com/SafaRahaf/kids-shop-backend/blob/be197c06f74ce12afb82d3af0c393ad3aa08b00e/.history/routes/UserRoutes_20231006193612.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req,
```


## License: unknown
https://github.com/prasad323/project/blob/3c722f9ad249c55edd012063108ca96b83938b8a/index.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
```


## License: unknown
https://github.com/shamapumbu/budgetApp/blob/77ab4695a79413fcf15fb9cf62cf1791f50a74b0/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
```


## License: unknown
https://github.com/SafaRahaf/kids-shop-backend/blob/be197c06f74ce12afb82d3af0c393ad3aa08b00e/.history/routes/UserRoutes_20231006193612.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
```


## License: unknown
https://github.com/prasad323/project/blob/3c722f9ad249c55edd012063108ca96b83938b8a/index.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
```


## License: MIT
https://github.com/Folawewo/synchronise/blob/3d3cbcf97ab646329338ea69a4392104e16a2177/controllers/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
```


## License: unknown
https://github.com/SafwenHali/WorkShift/blob/36be6cf47238f1f41517d98e5efdeb155cee365e/Backend/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
```


## License: unknown
https://github.com/iAtikurRahman/bookStore/blob/8e0902d0f3ec95e07b323d5b310ca10c437ba594/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
```


## License: unknown
https://github.com/prasad323/project/blob/3c722f9ad249c55edd012063108ca96b83938b8a/index.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.
```


## License: MIT
https://github.com/Folawewo/synchronise/blob/3d3cbcf97ab646329338ea69a4392104e16a2177/controllers/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.
```


## License: unknown
https://github.com/SafwenHali/WorkShift/blob/36be6cf47238f1f41517d98e5efdeb155cee365e/Backend/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.
```


## License: unknown
https://github.com/iAtikurRahman/bookStore/blob/8e0902d0f3ec95e07b323d5b310ca10c437ba594/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.
```


## License: unknown
https://github.com/prasad323/project/blob/3c722f9ad249c55edd012063108ca96b83938b8a/index.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await
```


## License: MIT
https://github.com/Folawewo/synchronise/blob/3d3cbcf97ab646329338ea69a4392104e16a2177/controllers/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await
```


## License: unknown
https://github.com/SafwenHali/WorkShift/blob/36be6cf47238f1f41517d98e5efdeb155cee365e/Backend/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await
```


## License: unknown
https://github.com/iAtikurRahman/bookStore/blob/8e0902d0f3ec95e07b323d5b310ca10c437ba594/controllers/authController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await
```


## License: unknown
https://github.com/aykutonlat/user_authentication/blob/285ec6b840710142082400bd305afe6f4b61d87c/server/controllers/superAdminControllers.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req
```


## License: unknown
https://github.com/aykutonlat/user_authentication/blob/285ec6b840710142082400bd305afe6f4b61d87c/server/controllers/superAdminControllers.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.
```


## License: unknown
https://github.com/YeppStudios/AsystentAI-Backend/blob/3602328aba26dd14232c305eb2a5aaadb4ac5866/src/routes/userRoutes.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  
```


## License: unknown
https://github.com/YeppStudios/AsystentAI-Backend/blob/3602328aba26dd14232c305eb2a5aaadb4ac5866/src/routes/userRoutes.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.fin
```


## License: unknown
https://github.com/nadeen-alirr/Admin-Dashboard-with-User-Management-System_Mm/blob/ac873069a20d8a29602345b329553aef4a53122a/BackEnd/Controller/AdminControler.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.fin
```


## License: unknown
https://github.com/YeppStudios/AsystentAI-Backend/blob/3602328aba26dd14232c305eb2a5aaadb4ac5866/src/routes/userRoutes.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!
```


## License: unknown
https://github.com/nadeen-alirr/Admin-Dashboard-with-User-Management-System_Mm/blob/ac873069a20d8a29602345b329553aef4a53122a/BackEnd/Controller/AdminControler.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!
```


## License: unknown
https://github.com/YeppStudios/AsystentAI-Backend/blob/3602328aba26dd14232c305eb2a5aaadb4ac5866/src/routes/userRoutes.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.
```


## License: unknown
https://github.com/nadeen-alirr/Admin-Dashboard-with-User-Management-System_Mm/blob/ac873069a20d8a29602345b329553aef4a53122a/BackEnd/Controller/AdminControler.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not foun
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title
```


## License: unknown
https://github.com/RiyazN0921/Library-backend-app/blob/40018d8f3f226948b066d87b69c290eefb4ddc63/src/controllers/book.controller.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.fin
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message
```


## License: unknown
https://github.com/Bayzed-Meer/I-library/blob/402b86b5316e3c65175477d1890ada58ffba06ce/server/controllers/bookController.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
```


## License: unknown
https://github.com/phuchoa2001/Backend_Template_Basic/blob/b19985b005d626e092ce303b4be1705902438d97/src/middleware/jwt.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_
```


## License: unknown
https://github.com/shakti9820/chat-Backend/blob/a950bf4e009a48dd6da918cae727b541e9b5a822/middleware/isAuth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_
```


## License: unknown
https://github.com/lisiuwai/fyp/blob/a375f55a58a3f8293746e1361a2b05c3cec68ca3/pages/api/user/information.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).
```


## License: unknown
https://github.com/Saleh-SAFCSP/Nodejs_JWT/blob/b934ceb938714361051de0399fe22e8a6aff6f28/middleware/auth.js

```
I'll upgrade your Admin Panel with all the requested features while maintaining existing functionality. Let me provide comprehensive changes across backend and frontend.

---

## Backend Changes

### 1. Update User Model (Add Super Admin Role)

````javascript
// filepath: backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Student', 'Admin', 'Super Admin'],
      default: 'Student'
    },
    profile: {
      phone: String,
      address: String,
      avatar: String
    },
    finesBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
````

### 2. Update Book Model (Add New Fields)

````javascript
// filepath: backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'N/A'
    },
    publisher: {
      type: String,
      default: 'N/A'
    },
    publishedYear: {
      type: Number,
      default: null
    },
    isbn: {
      type: String,
      default: 'N/A',
      sparse: true
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Cover'
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Validation: availableCopies should not exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
````

### 3. Update Auth Controller (Add Super Admin)

````javascript
// filepath: backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Super Admin
exports.initializeSuperAdmin = async (req, res) => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const superAdmin = new User({
      name: 'System Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'Super Admin'
    });

    await superAdmin.save();
    res.json({ message: 'Super Admin initialized successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'Student'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 4. Create New Admin Controller

````javascript
// filepath: backend/controllers/adminManagementController.js
const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const createdById = req.user.id;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'Admin',
      createdBy: createdById
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change user role (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying Super Admin
    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const validRoles = ['Student', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `User promoted to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate/Remove Admin (Super Admin only)
exports.deactivateAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot remove Super Admin' });
    }

    if (user.role !== 'Admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    user.isActive = false;
    user.role = 'Student';
    await user.save();

    res.json({
      message: 'Admin removed and demoted to Student',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all books (for admin all books page)
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, genre, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
````

### 5. Update Book Controller

````javascript
// filepath: backend/controllers/bookController.js
// ...existing code...

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      description: description || 'N/A',
      publisher: publisher || 'N/A',
      publishedYear: publishedYear || null,
      isbn: isbn || 'N/A',
      coverImage: coverImage || 'https://via.placeholder.com/300x450?text=No+Cover',
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      createdBy: req.user.id
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      description,
      publisher,
      publishedYear,
      isbn,
      coverImage,
      totalCopies,
      availableCopies
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear !== undefined ? publishedYear : book.publishedYear;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.coverImage = coverImage || book.coverImage;
    book.totalCopies = totalCopies || book.totalCopies;
    book.availableCopies = Math.min(availableCopies || book.availableCopies, book.totalCopies);

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ...existing code...
````

### 6. Update Auth Middleware

````javascript
// filepath: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorize
```

