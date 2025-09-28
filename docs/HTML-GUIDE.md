# 📄 HTML Structure Guide - Grade 9 Web Development

## What is HTML?

**HTML (HyperText Markup Language)** is the skeleton of every webpage. It defines the structure and content of web pages using "tags" that tell the browser what each piece of content represents.

Think of HTML like the frame of a house - it gives structure, but needs CSS (paint and decoration) and JavaScript (electricity and plumbing) to be fully functional.

## 🏗️ Basic HTML Structure

Every HTML page in our project follows this pattern:

```html
<!DOCTYPE html>                    <!-- Tells browser this is HTML5 -->
<html lang="en">                   <!-- Root element, sets language -->
<head>                             <!-- Information ABOUT the page -->
    <meta charset="UTF-8">         <!-- How to read special characters -->
    <meta name="viewport"...>      <!-- How to display on phones/tablets -->
    <title>Page Name</title>       <!-- Shows in browser tab -->
    <link rel="stylesheet"...>     <!-- Links to CSS files -->
</head>
<body>                             <!-- What users actually see -->
    <!-- Page content goes here -->
    <script src="..."></script>    <!-- Links to JavaScript files -->
</body>
</html>
```

## 🧩 Key HTML Concepts We Use

### **1. Semantic Elements**
We use HTML tags that describe meaning, not just appearance:

```html
<nav>         <!-- Navigation menu -->
<main>        <!-- Main content of the page -->
<section>     <!-- A distinct section of content -->
<header>      <!-- Top of a page or section -->
<footer>      <!-- Bottom of a page or section -->
<article>     <!-- Self-contained content -->
```

**Why this matters**: Screen readers and search engines understand your page better!

### **2. Forms and Inputs**
Our app collects user input using form elements:

```html
<form id="student-form">                    <!-- Groups related inputs -->
    <label for="student-name">Name:</label> <!-- Describes what input does -->
    <input type="text" id="student-name" required>  <!-- Text input -->
    <button type="submit">Add Student</button>      <!-- Submits the form -->
</form>
```

**Key Points**:
- `id` links labels to inputs for accessibility
- `required` makes fields mandatory  
- `type` tells browser what kind of input to expect

### **3. Interactive Elements**
Elements that users can click or interact with:

```html
<button onclick="startTimer()">Start</button>    <!-- Clickable button -->
<a href="timer.html">Timer Page</a>             <!-- Link to another page -->
<select id="class-selector">                     <!-- Dropdown menu -->
    <option value="1">Period 1</option>
</select>
```

## 📋 HTML Structure in Our Pages

### **Navigation (Same on Every Page)**
```html
<nav class="navbar is-primary" role="navigation">
    <div class="navbar-brand">
        <a href="index.html">Classroom Tools</a>
    </div>
    <div class="navbar-menu">
        <a href="timer.html">Timer</a>
        <a href="students.html">Students</a>
        <!-- More navigation links -->
    </div>
</nav>
```

**What this teaches**:
- Navigation provides consistent user experience
- Links use relative URLs (just filename, not full web address)
- CSS classes style the navigation

### **Main Content Area**
```html
<main class="section">
    <div class="container">
        <h1 class="title">Page Title</h1>
        <!-- Page-specific content -->
    </div>
</main>
```

**What this teaches**:
- `<main>` tells screen readers where the main content is
- CSS classes from Bulma framework provide styling
- Proper heading hierarchy (h1 → h2 → h3) organizes content

### **Modals (Pop-up Windows)**
```html
<div class="modal" id="add-student-modal">
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Add Student</p>
            <button class="delete close-modal"></button>
        </header>
        <section class="modal-card-body">
            <!-- Form content here -->
        </section>
        <footer class="modal-card-foot">
            <button class="button is-success">Save</button>
            <button class="button close-modal">Cancel</button>
        </footer>
    </div>
</div>
```

**What this teaches**:
- Complex UI components need structured HTML
- IDs allow JavaScript to show/hide specific modals
- Proper semantic structure (header, body, footer)

## 🎯 HTML Best Practices We Follow

### **1. Accessibility**
```html
<!-- Good: Descriptive text -->
<button aria-label="Close modal">×</button>

<!-- Good: Form labels linked to inputs -->
<label for="timer-minutes">Minutes:</label>
<input type="number" id="timer-minutes">

<!-- Good: Alt text for images -->
<img src="icon.png" alt="Timer icon">
```

### **2. Semantic Meaning**
```html
<!-- Good: Uses semantic elements -->
<article>
    <header>
        <h2>Student Information</h2>
    </header>
    <p>Content about the student...</p>
</article>

<!-- Less good: Generic divs -->
<div>
    <div>Student Information</div>
    <div>Content about the student...</div>
</div>
```

### **3. Clean, Readable Code**
```html
<!-- Good: Properly indented and organized -->
<div class="card">
    <header class="card-header">
        <p class="card-header-title">Settings</p>
    </header>
    <div class="card-content">
        <p>Settings content here</p>
    </div>
</div>
```

## 🔗 How HTML Connects to CSS and JavaScript

### **CSS Connection**
```html
<div class="button is-primary">    <!-- CSS classes style this -->
<div id="timer-display">           <!-- CSS can target specific IDs -->
```

### **JavaScript Connection**
```html
<button onclick="startTimer()">           <!-- Calls JavaScript function -->
<div id="noise-level">                    <!-- JavaScript finds by ID -->
<form onsubmit="handleSubmit(event)">     <!-- JavaScript handles form -->
```

## 📚 Learning Exercises

### **Exercise 1: Find Examples**
Look through our HTML files and find:
1. Three different types of input elements
2. Two examples of semantic HTML elements
3. One form and identify all its parts

### **Exercise 2: Make Changes**
1. Change the title text on any page
2. Add a new navigation link (even if the page doesn't exist yet)
3. Add a new button to any page

### **Exercise 3: Understanding Structure**
1. Draw the structure of one HTML page as a family tree
2. Identify which elements are containers vs. content
3. Find where CSS classes are used vs. IDs

## 🚨 Common HTML Mistakes to Avoid

### **1. Forgetting Closing Tags**
```html
<!-- Wrong -->
<div>Content
<p>More content

<!-- Right -->
<div>Content</div>
<p>More content</p>
```

### **2. Missing Required Attributes**
```html
<!-- Wrong -->
<img src="photo.jpg">
<input type="text">

<!-- Right -->
<img src="photo.jpg" alt="Student photo">
<input type="text" id="student-name">
```

### **3. Incorrect Nesting**
```html
<!-- Wrong -->
<p>This is <div>nested incorrectly</div></p>

<!-- Right -->
<div>
    <p>This is nested correctly</p>
</div>
```

## 🎉 Why HTML Matters

- **Foundation**: Everything on the web starts with HTML
- **Accessibility**: Proper HTML helps everyone use your site
- **SEO**: Search engines understand well-structured HTML
- **Maintenance**: Clean HTML is easier to update and fix
- **Teamwork**: Other developers can understand and work with your code

**Remember**: HTML is just the beginning! CSS makes it look good, and JavaScript makes it interactive. But without solid HTML structure, nothing else works properly.

---

*Next: Check out CSS-GUIDE.md to learn how we style these HTML elements!*