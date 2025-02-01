# Troubleshooting Guide

## Common Issues and Solutions

### Development Server
1. **Server Won't Start**
   ```
   Error: Port 3000 is already in use
   ```
   Solution:
   - Kill existing process:
     ```bash
     npx kill-port 3000
     ```
   - Or use different port:
     ```bash
     PORT=3001 npm run dev
     ```

2. **Hot Reload Not Working**
   - Clear browser cache
   - Restart development server
   - Check file watchers limit (Linux):
     ```bash
     echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
     sudo sysctl -p
     ```

### Build Issues
1. **TypeScript Errors**
   - Update TypeScript:
     ```bash
     npm install typescript@latest
     ```
   - Clear TypeScript cache:
     ```bash
     rm -rf node_modules/.cache/tsc
     ```

2. **Module Not Found**
   - Clear node_modules:
     ```bash
     rm -rf node_modules
     npm install
     ```
   - Check import paths
   - Verify tsconfig.json paths

### React Problems
1. **Component Not Rendering**
   - Check React DevTools
   - Verify props passing
   - Check for runtime errors
   - Validate component export/import

2. **State Updates Not Reflecting**
   - Verify setState usage
   - Check for async state updates
   - Confirm component re-rendering
   - Use React DevTools

### Performance Issues
1. **Slow Development Server**
   - Clear node_modules cache
   - Update dependencies
   - Check for memory leaks
   - Monitor system resources

2. **Bundle Size Too Large**
   - Analyze bundle:
     ```bash
     npm run build -- --analyze
     ```
   - Implement code splitting
   - Remove unused dependencies
   - Use dynamic imports

## Debugging Tools
1. **Browser DevTools**
   - Console logging
   - Network requests
   - React components
   - Performance profiling

2. **VS Code Debugging**
   - Set breakpoints
   - Watch variables
   - Step through code
   - Inspect call stack

## Error Reporting
When reporting issues:
1. Include error message
2. List reproduction steps
3. Share relevant code
4. Describe expected behavior
5. Note environment details