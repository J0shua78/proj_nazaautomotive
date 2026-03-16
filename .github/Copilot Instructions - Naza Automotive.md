# Copilot Instructions - Naza Automotive Test Drive CRM

## Project Overview
This is a lightweight CRM system for managing test drive leads at Naza Automotive. The application uses vanilla JavaScript with a modern, efficient UI design focused on performance and usability.

## File Structure
```
proj_nazaautomotive/
├── pages/
│   ├── test-drive-list-cs.html    (Main test drive list view)
│   ├── lead-form-add.html         (Add new test drive form)
│   └── [other pages]
├── assets/
│   └── [styles, images, icons]
└── copilot-instructions.md        (This file)
```

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Custom CSS with design system variables
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Nunito Sans (Google Fonts)
- **Architecture**: MVC-style with ObjectsController class

## Design System (CSS Variables)
Located in `:root` selector:
- `--px-bg`: Background color (#f9fafd)
- `--px-primary`: Primary action color (#3874ff)
- `--px-text-main`: Main text color (#232e3e)
- `--input-height`: 2.5rem
- `--grid-gap`: 0.5rem
- `--base-font`: 0.8rem

**Usage**: Always use CSS variables for colors and dimensions to maintain consistency.

## Code Standards

### JavaScript
- Use `const`/`let` instead of `var`
- Class-based architecture for controllers
- Event delegation for dynamic elements
- State management centralized in controller's `state` object
- Arrow functions preferred for callbacks

### CSS
- Mobile-first responsive design
- Use CSS Grid for layouts
- Transition duration: 0.2s for consistency
- Border radius: 0.3-0.4rem
- Box shadows use `var(--px-shadow)`

### HTML
- Semantic HTML5 elements
- Floating label pattern for form inputs
- Data attributes for sorting/filtering hooks
- ARIA attributes for accessibility (as needed)

## Common Patterns

### Floating Labels
```html
<div class="form-floating">
    <input type="text" id="search-objects" placeholder=" ">
    <label>Search Lead ID, Name, or Vehicle</label>
</div>
```

### Status Badges
- `.status-new` - Sky blue
- `.status-contacted` - Amber
- `.status-qualified` - Light gold
- `.status-in-progress` - Purple
- `.status-converted` - Green
- `.status-lost-closed` - Red

### Table Sorting
- Click column headers to sort
- Supports `asc`/`desc` directions
- Active sorts show Font Awesome icons
- Field name stored in `data-sort` attribute

### Pagination
- Default: 10 items per page
- Options: 10, 25, 50, ALL
- Prev/Next buttons respect page boundaries
- Page info displays current/total pages

## Data Structure
Test Drive objects have these properties:
```javascript
{
  id: string,
  objectId: string,              // Lead ID
  name: string,                  // Customer name
  vehicleInterest: string,       // Model interested in
  priority: string,              // High/Medium/Normal
  consultant: string,            // Sales person name
  createDate: string,            // YYYY-MM-DD format
  status: string,                // New/Contacted/Qualified/In Progress/Converted/Lost / Closed
  mobile: string                 // Phone number
}
```

## Modification Guidelines

### Adding New Columns
1. Add `<th class="sortable" data-sort="fieldName">Column Title</th>`
2. Add field to mock data or API response
3. Update `update()` method's map function to include new `<td>`
4. Adjust grid layout if needed for responsiveness

### Adding Filters
1. Create filter input with class `form-floating`
2. Add event listener in `bindEvents()` that calls `this.filter()`
3. Update filter logic in `filter()` method with new condition

### Adding Actions
1. Create button in action column: `<button onclick="methodName('${obj.id}')">Action</button>`
2. Add method to controller or window object
3. Consider modal dialogs for complex operations

### Responsive Breakpoints
- Mobile: `max-width: 480px` (columns stack to 12)
- Tablet: `max-width: 600px` (table summary hidden)
- Desktop: Full grid layout

## Testing
- Mock data: 25 test records in `mockObjectsData`
- All statuses represented
- All priorities represented
- Test with different page limits and filters

## Performance Considerations
- Uses client-side filtering/sorting (no API calls in current version)
- Efficient CSS with minimal repaints
- Debouncing not needed for current data size
- Consider adding debounce if API calls are implemented

## Future Enhancements
- [ ] Connect to backend API
- [ ] Add export to Excel/PDF
- [ ] Implement real-time updates
- [ ] Add advanced filtering (date ranges, multi-select)
- [ ] Add bulk actions
- [ ] Implement user authentication
- [ ] Add activity history