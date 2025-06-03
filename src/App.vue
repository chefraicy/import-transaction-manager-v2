<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="nav-icon">🚢</span>
          <h1>Import Transaction Manager</h1>
        </div>
        <div class="header-actions">
          <span class="user-info">Welcome, Admin</span>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-content">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <span class="nav-icon">🏠</span>
          Dashboard
        </router-link>
        <router-link to="/transactions" class="nav-link" active-class="active">
          <span class="nav-icon">📋</span>
          Transactions
        </router-link>
        <router-link to="/file-manager" class="nav-link" active-class="active">
          <span class="nav-icon">📁</span>
          File Manager
        </router-link>
        <router-link to="/permits" class="nav-link" active-class="active">
          <span class="nav-icon">📄</span>
          Permits
        </router-link>
        <router-link to="/kpi-dashboard" class="nav-link" active-class="active">
          <span class="nav-icon">📊</span>
          KPI Dashboard
        </router-link>
        <router-link to="/logs" class="nav-link" active-class="active">
          <span class="nav-icon">📝</span>
          Logs
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 Import Transaction Manager. All rights reserved.</p>
        <p>Version 1.0.0</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global styles are imported in main.js */
</style>