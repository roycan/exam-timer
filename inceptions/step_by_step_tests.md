# Step-by-Step User Acceptance Tests - Classroom Management Tools

## Timer Module Tests

### Test 1: Basic Countdown Timer
1. Navigate to the application homepage
2. Verify Timer tab is active by default
3. Verify default display shows "25:00"
4. Click the "Start" button
5. **Verify**: Timer begins counting down (24:59, 24:58, etc.)
6. Click the "Pause" button after 5 seconds
7. **Verify**: Timer display freezes and stops decrementing
8. Wait 3 seconds
9. **Verify**: Timer display remains frozen at paused time
10. Click "Start" again
11. **Verify**: Timer resumes counting from paused time
12. Click "Reset" button
13. **Verify**: Timer returns to "25:00" and stops

### Test 2: Stopwatch Mode
1. Click "Stopwatch" button to switch modes
2. **Verify**: Display shows "00:00" and title changes to "Stopwatch"
3. **Verify**: Progress bar disappears (stopwatch mode only)
4. Click "Start" button
5. **Verify**: Timer counts up from 00:00 (00:01, 00:02, etc.)
6. Click "Pause" after 10 seconds
7. **Verify**: Timer stops at current time
8. Click "Reset"
9. **Verify**: Timer returns to "00:00"

### Test 3: Preset Time Buttons
1. Switch back to "Countdown" mode
2. Click "5 min" preset button
3. **Verify**: Timer displays "05:00"
4. Click "15 min" preset button  
5. **Verify**: Timer displays "15:00"
6. Click "90 min" preset button
7. **Verify**: Timer displays "90:00" (1:30:00 format)
8. Test all other preset buttons (10, 25, 45 minutes)
9. **Verify**: Each preset sets correct time display

### Test 4: Custom Time Setting
1. In Custom Time section, set Hours: 0, Minutes: 3, Seconds: 30
2. Click "Set Time" button
3. **Verify**: Timer displays "03:30"
4. Start the timer and let it run for 10 seconds
5. **Verify**: Timer counts down accurately
6. Set Hours: 1, Minutes: 15, Seconds: 45
7. Click "Set Time"
8. **Verify**: Timer displays "1:15:45"

## Student Management Tests

### Test 5: Class Selection and Student Management
1. Click "Students" tab
2. **Verify**: Class dropdown is present
3. Select a class from dropdown
4. **Verify**: Student list appears for selected class
5. **Verify**: No student ID numbers are visible anywhere
6. **Verify**: Only student names are displayed
7. Click checkboxes to mark students present/absent
8. **Verify**: Checkbox states update immediately
9. **Verify**: Present/absent status persists during session

### Test 6: Random Student Selection
1. Ensure at least 3 students are marked present
2. Click "Select Student" button
3. **Verify**: Random student name displays in large text
4. **Verify**: Selected student name is clearly visible
5. Click "Select Student" multiple times
6. **Verify**: Different students get selected over multiple clicks
7. **Verify**: Recently selected students appear less frequently (smart selection)
8. Click "Clear" button
9. **Verify**: Student selection clears and displays default message

### Test 7: CSV Import Functionality  
1. Click "Download Template" button
2. **Verify**: CSV file downloads with name-only format
3. **Verify**: Template contains headers: "name" (no ID column)
4. Open template and add 5 test student names
5. Save modified CSV file
6. Click CSV upload input and select your test file
7. **Verify**: Success message appears indicating import count
8. **Verify**: New students appear in student list
9. **Verify**: No student IDs are displayed for imported students

## Noise Monitor Tests

### Test 8: Noise Monitoring Setup
1. Click "Noise Monitor" tab
2. **Verify**: Microphone permission request appears
3. Grant microphone access
4. **Verify**: "Start Monitoring" button becomes enabled
5. Click "Start Monitoring"
6. **Verify**: Real-time noise level bars appear
7. **Verify**: Current noise level updates continuously
8. **Verify**: Status shows current noise category (Quiet, Acceptable, etc.)

### Test 9: Progressive Noise Thresholds
1. With monitoring active, locate threshold sliders
2. **Verify**: Four threshold categories exist:
   - Quiet (Green)
   - Acceptable (Yellow) 
   - Firm Warning (Orange)
   - Strong Warning (Red)
3. Adjust "Firm Warning" threshold slider
4. **Verify**: Threshold updates immediately in display
5. Adjust "Strong Warning" threshold slider  
6. **Verify**: Color bands update to reflect new thresholds
7. Make noise to trigger different levels
8. **Verify**: Status text changes to match noise level
9. **Verify**: Noise level bars change colors appropriately

### Test 10: Alert System Testing
1. Enable "Visual alerts" checkbox
2. Enable "Audio alerts" checkbox
3. **Verify**: Audio alert sound dropdown becomes available
4. Select different alert sounds (Chime, Bell, Beep, Gentle)
5. Make noise to exceed firm warning threshold
6. **Verify**: Screen border flashes red (visual alert)
7. **Verify**: Alert sound plays (may require actual audio environment)
8. Exceed threshold again within 3 seconds
9. **Verify**: Audio alert respects cooldown period (no repeated sound)
10. Wait 4 seconds and exceed threshold again
11. **Verify**: New audio alert plays after cooldown

## Focus Mode Tests

### Test 11: Focus Mode Activation
1. Click "Focus Mode" tab
2. Type a custom message in the message input field
3. Click "Enter Focus Mode" button
4. **Verify**: Application enters full-screen mode
5. **Verify**: Only the focus message is displayed prominently
6. **Verify**: Message text is large and clearly readable
7. Press Escape key or click exit control
8. **Verify**: Returns to normal interface
9. **Verify**: Custom message persists in input field

### Test 12: Focus Mode Message Persistence
1. Enter a different focus message
2. Click "Enter Focus Mode"
3. Exit focus mode
4. Navigate to different tab (Timer)
5. Return to Focus Mode tab
6. **Verify**: Previous message is still displayed in input
7. Enter focus mode again
8. **Verify**: Same message displays in focus mode

## Exit Tickets Tests

### Test 13: Exit Ticket Categories and Prompts
1. Click "Exit Tickets" tab
2. **Verify**: Category filter dropdown is present
3. **Verify**: Pre-made prompts are displayed
4. Select "Reflection" category
5. **Verify**: Prompts filter to show only reflection-type questions
6. Select "Comprehension" category
7. **Verify**: Different set of prompts appears
8. Select "All Categories"
9. **Verify**: All available prompts display

### Test 14: Custom Exit Ticket Creation
1. Click "Create Custom Prompt" or similar control
2. Enter a custom exit ticket question
3. Select a category for the custom prompt
4. Save the custom prompt
5. **Verify**: New prompt appears in the prompt list
6. **Verify**: Custom prompt appears when filtering by its category
7. Edit the custom prompt
8. **Verify**: Changes save and display correctly
9. Delete the custom prompt
10. **Verify**: Prompt is removed from list

### Test 15: Exit Ticket Display
1. Select any exit ticket prompt
2. Click "Display Prompt" or similar control
3. **Verify**: Prompt displays in full-screen mode
4. **Verify**: Text is large and readable for classroom viewing
5. **Verify**: Can exit full-screen display mode
6. Select a different prompt
7. Click display again
8. **Verify**: New prompt replaces previous in full-screen

## Integration & Cross-Feature Tests

### Test 16: Multi-Tool Session Management
1. Start a 10-minute timer
2. Switch to Students tab while timer runs
3. Select a random student
4. Switch to Noise Monitor tab
5. Start noise monitoring
6. Switch back to Timer tab
7. **Verify**: Timer continued running correctly during tab switches
8. **Verify**: Selected student persists when returning to Students tab
9. **Verify**: Noise monitoring continues in background

### Test 17: Settings Persistence
1. Configure custom timer settings (enable alerts, set custom time)
2. Adjust noise monitor thresholds
3. Create a custom exit ticket
4. Refresh the browser page
5. **Verify**: Timer settings are restored
6. **Verify**: Noise thresholds remain at custom values
7. **Verify**: Custom exit ticket still exists
8. **Verify**: Selected class persists after refresh

### Test 18: Error Handling & Edge Cases
1. Try to select random student with no students marked present
2. **Verify**: Appropriate error message displays
3. Try to upload invalid CSV file
4. **Verify**: Clear error message explaining the problem
5. Deny microphone access for noise monitor
6. **Verify**: Helpful error message explains microphone requirement
7. Set timer to 0:00:00 custom time
8. **Verify**: Appropriate handling of zero-time edge case