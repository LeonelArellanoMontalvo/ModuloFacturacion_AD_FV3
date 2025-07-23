# **App Name**: APDIS Manager

## Core Features:

- Customer Type Management: CRUD interface for 'Tipo de Clientes' (Customer Types) with standard operations.
- Customer Management: CRUD interface for 'Clientes' (Customers), referencing existing 'Tipo de Clientes'. Displays warning if no customer types exist.
- Invoice Header Management: CRUD interface for 'Facturas' (Invoices).  Allows invoice creation with customer selection from a list of registered clients, fetching client info dynamically. Restricts creation if no customers exist. Backend auto-generates invoice numbers. 'monto_total' is automatically generated in the backend.
- Invoice Detail Management: Nested interface within Invoice Management for 'Detalle Facturas' (Invoice Details). Displays details in a dropdown per invoice.  Includes dynamic forms for adding/removing detail items, product selection (disabling already-selected products), and real-time subtotal calculation (quantity * price from https://productos-three-orpin.vercel.app/api/productos) on quantity change, but the changes are only showed dinamically (the amount is not saved on the client side).

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5), conveying trust and stability.
- Background color: Light Gray (#F0F2F5), providing a clean and neutral backdrop.
- Accent color: Soft Purple (#9575CD), used for interactive elements and highlights, giving a modern touch.
- Font pairing: 'Inter' (sans-serif) for body text providing clarity and 'Space Grotesk' (sans-serif) for headings, creating a modern contrast.
- Use simple, outlined icons from a consistent set (e.g., Material Design Icons) to represent actions and data types. Ensure they are easily recognizable.
- Employ a grid-based layout with sufficient white space for readability. Use clear separation between CRUD sections (list, create, edit) for each entity. Keep action buttons consistently positioned (e.g., at the bottom-left in tables).
- Incorporate subtle transitions (e.g., fade-in) when loading data or expanding/collapsing detail sections to enhance the user experience without being distracting.