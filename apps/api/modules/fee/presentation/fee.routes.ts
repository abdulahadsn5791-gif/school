import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createFeeModule } from '../fee.module';

const feeRoutes = new Hono();
const { feeController } = createFeeModule();

// Structures
feeRoutes.get('/fee-structures', authMiddleware, feeController.listStructures);
feeRoutes.get('/fee-structures/:id', authMiddleware, feeController.getStructureById);
feeRoutes.post('/fee-structures', authMiddleware, adminMiddleware, feeController.createStructure);
feeRoutes.delete(
  '/fee-structures/soft',
  authMiddleware,
  adminMiddleware,
  feeController.softDeleteStructure,
);

// Invoices
feeRoutes.get('/invoices', authMiddleware, feeController.listInvoices);
feeRoutes.get('/invoices/:id', authMiddleware, feeController.getInvoiceById);
feeRoutes.post('/invoices', authMiddleware, adminMiddleware, feeController.issueInvoice);
feeRoutes.patch('/invoices/waive', authMiddleware, adminMiddleware, feeController.waiveInvoice);

// Payments
feeRoutes.get('/payments', authMiddleware, feeController.listPayments);
feeRoutes.post('/payments', authMiddleware, adminMiddleware, feeController.recordPayment);

export default feeRoutes;
