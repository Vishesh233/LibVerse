import React from 'react';
import { StaffDashboard } from '../components/dashboard/StaffDashboard';

/** Librarian home: shared staff dashboard (same layout as admin, without "Add user") */
export const LibrarianDashboard = () => <StaffDashboard role="librarian" />;
