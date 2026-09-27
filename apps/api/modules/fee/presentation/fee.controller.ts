import {
  createFeeStructureDto,
  deleteFeeStructureDto,
  getFeeStructuresDto,
  getInvoicesDto,
  idSchema,
  invoiceIdDto,
  issueInvoiceDto,
  recordPaymentDto,
  waiveInvoiceDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { FeeAppService } from '../application/fee.app.service';

export class FeeController extends BaseController<FeeAppService> {
  // ── Structures ────────────────────────────────────────────────────────────

  createStructure = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createFeeStructureDto);
    return this.created(c, await this.service.createStructure(data, actor));
  };

  getStructureById = async (c: Context) => {
    const structureId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getStructure(structureId));
  };

  listStructures = async (c: Context) => {
    const query = this.query(c, getFeeStructuresDto);
    return this.ok(c, await this.service.listStructures(query));
  };

  softDeleteStructure = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteFeeStructureDto);
    const message = await this.service.softDeleteStructure(data, actor);
    return this.ok(c, { message });
  };

  // ── Invoices ──────────────────────────────────────────────────────────────

  issueInvoice = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, issueInvoiceDto);
    return this.created(c, await this.service.issueInvoice(data, actor));
  };

  getInvoiceById = async (c: Context) => {
    const invoiceId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getInvoice(invoiceId));
  };

  listInvoices = async (c: Context) => {
    const query = this.query(c, getInvoicesDto);
    return this.ok(c, await this.service.listInvoices(query));
  };

  waiveInvoice = async (c: Context) => {
    const data = await this.body(c, waiveInvoiceDto);
    return this.ok(c, await this.service.waiveInvoice(data, requireActor()));
  };

  // ── Payments ──────────────────────────────────────────────────────────────

  recordPayment = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, recordPaymentDto);
    return this.created(c, await this.service.recordPayment(data, actor));
  };

  listPayments = async (c: Context) => {
    const invoiceId = this.query(c, invoiceIdDto).invoiceId;
    return this.ok(c, await this.service.listPayments(invoiceId));
  };
}
