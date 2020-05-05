import { Component, OnInit } from '@angular/core';
import { DialogService, TreeNode } from 'primeng/api';
import { Op } from 'sequelize';

import { RecordType } from '@core/interfaces';
import { Category } from '@core/models/category';
import { Helpers } from '@core/helpers.class';
import { Record } from '@core/models/record';
import { AnalyzeService } from '@core/services/analyze.service';
import { TableColumn, TableActions } from '@shared/components/table/table.interface';
import { PlanningManageComponent } from './manage/manage.component';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html'
})
export class PlanningComponent implements OnInit {
  loading = true;
  actionsCallback: TableActions;
  columns: TableColumn[];
  records: TreeNode[];

  constructor(
    private dialog: DialogService,
    private analyzeService: AnalyzeService
  ) { }

  ngOnInit() {
    this.actionsCallback = {
      onCreate: this.create.bind(this),
      onDelete: this.delete.bind(this),
      onUpdate: this.update.bind(this)
    };
    this.columns = [
      { field: 'type', header: 'Тип', span: .6, format: type => type === RecordType.income ? 'Доход' : 'Расход' },
      { field: 'category.name', header: 'Категория' },
      { field: 'subcategory.name', header: 'Подкатегория' },
      { field: 'plan', header: 'План', format: val => Helpers.formatCurrency(val) },
      { field: 'amount', header: 'Факт', format: val => Helpers.formatCurrency(val) },
      { field: 'difference', header: 'Разница', format: val => Helpers.formatCurrency(val) }
    ];
    this.getPlanningData();
  }

  getPlan(record: Record, ) {
    return record.subcategory ? record.subcategory.plan : record.category.plan;
  }

  async getPlanningData() {
    this.loading = true;

    const treeData: TreeNode[] = [];
    const recs = await this.analyzeService.getPlanningData();
    const getRec = r => {
      r.plan = this.getPlan(r);
      r.difference = r.plan - r.amount;

      return { data: r };
    };

    recs.forEach(r => {
      if (!r.subcategory) {
        treeData.push(getRec(r));
      } else {
        const treeNode = treeData.find(d => {
          const rec = d.data as Record;

          return rec.categoryId === r.categoryId;
        });

        if (treeNode) {
          if (!treeNode.children) {
            treeNode.children = [];
          }

          treeNode.children.push(getRec(r));
        }
      }
    });
    this.records = treeData;
    this.loading = false;
  }

  openDialog(header: string, data = {}) {
    return this.dialog.open(PlanningManageComponent, {
      header,
      data,
      width: '350px'
    });
  }

  async setCategoryPlan(category: Category, oldCategoryPlan = 0) {
    if (category.parentId) {
      const cat = await Category.findByPk(category.parentId);

      cat.plan += category.plan - oldCategoryPlan;
      cat.save();
    }

    await category.save();
    await this.getPlanningData();
  }

  create() {
    this.openDialog('Добавить показатель').onClose.subscribe((cat: Category) => {
      if (cat) {
        this.setCategoryPlan(cat);
      }
    });
  }

  update(record: Record) {
    const oldPlan = record.subcategory?.plan || 0;

    this.openDialog('Изменить показатель', { record }).onClose.subscribe(async (cat: Category) => {
      if (cat) {
        if (cat) {
          this.setCategoryPlan(cat, oldPlan);
        }
      }
    });
  }

  async delete(record: Record) {
    if (record.subcategory) {
      const subcat = record.subcategory;
      const cat = await Category.findByPk(subcat.parentId);

      cat.plan -= subcat.plan;
      subcat.plan = null;
      subcat.save();
      cat.save();
    } else {
      const cat = record.category;
      const subcats: Category[] = await Category.findAll({ where: { parentId: cat.id, plan: { [Op.not]: null } } });

      subcats.forEach(async c => await c.update({ plan: null }));
      cat.plan = null;
      cat.save();
    }

    await this.getPlanningData();
  }
}
