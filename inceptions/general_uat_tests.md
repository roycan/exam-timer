# General User Acceptance Tests - Classroom Management Tools

## Timer Functionality
- [ ] **Timer Display**: Large, clear timer display visible from all classroom positions
- [ ] **Countdown Mode**: Timer counts down accurately from set time to zero
- [ ] **Stopwatch Mode**: Timer counts up accurately from zero
- [ ] **Preset Buttons**: All preset time buttons (5, 10, 15, 25, 45, 90 min) set correct times
- [ ] **Custom Time Setting**: Hours, minutes, seconds inputs create accurate custom timers
- [ ] **Start/Pause/Reset Controls**: All timer controls function correctly
- [ ] **Progress Bar**: Visual progress bar updates smoothly during countdown
- [ ] **Audio Alerts**: 5-minute warning and last-minute beeps play when enabled
- [ ] **Timer Completion**: Timer stops at zero and plays completion sound

## Student Management
- [ ] **Class Selection**: Can select different class periods from dropdown
- [ ] **Random Student Selection**: Selects random students from present students only
- [ ] **Smart Selection Algorithm**: Recently called students less likely to be selected again
- [ ] **Attendance Tracking**: Can mark students present/absent with immediate UI updates
- [ ] **CSV Import**: Can upload CSV files with student names successfully
- [ ] **CSV Template Download**: Template downloads with correct format (name column only)
- [ ] **Student Display**: Selected student name displays clearly for whole class
- [ ] **Clear Selection**: Can clear selected student and start fresh

## Noise Monitoring
- [ ] **Microphone Access**: System requests and receives microphone permission
- [ ] **Real-time Monitoring**: Noise levels update continuously during monitoring
- [ ] **Progressive Thresholds**: Four distinct levels (quiet, acceptable, firm warning, strong warning)
- [ ] **Visual Alerts**: Screen border flashes red during noise violations
- [ ] **Audio Alerts**: Different alert sounds play for different threshold violations
- [ ] **Threshold Customization**: Sliders adjust thresholds and update monitoring immediately
- [ ] **Alert Cooldown**: Audio alerts respect cooldown period (no spam)
- [ ] **Sensitivity Adjustment**: Microphone sensitivity slider affects input levels

## Focus Mode
- [ ] **Focus Mode Activation**: Successfully enters full-screen focus display
- [ ] **Message Display**: Custom messages display clearly in focus mode
- [ ] **Focus Mode Exit**: Can exit focus mode and return to normal interface
- [ ] **Message Persistence**: Focus messages remain between mode switches

## Exit Tickets
- [ ] **Prompt Categories**: Can filter prompts by different categories
- [ ] **Pre-made Prompts**: Built-in prompts display correctly when selected
- [ ] **Custom Prompts**: Can create and save custom exit ticket prompts
- [ ] **Full-screen Display**: Selected prompts display in full-screen mode for class viewing
- [ ] **Prompt Management**: Can edit and delete custom prompts

## Navigation & Interface
- [ ] **Tab Navigation**: All main tabs (Timer, Students, Noise Monitor, Focus Mode, Exit Tickets) accessible
- [ ] **Responsive Design**: Interface adapts properly to different screen sizes
- [ ] **Settings Persistence**: User preferences save between sessions
- [ ] **Clean Interface**: No distracting elements or unnecessary complexity
- [ ] **Error Handling**: Appropriate error messages for failed operations
- [ ] **Loading States**: Loading indicators during data operations

## Cross-Feature Integration
- [ ] **Multi-tool Usage**: Can use multiple tools simultaneously without conflicts
- [ ] **Session Management**: All tools maintain state during multi-feature usage
- [ ] **Performance**: Application remains responsive during intensive operations
- [ ] **Data Consistency**: Student data remains consistent across features