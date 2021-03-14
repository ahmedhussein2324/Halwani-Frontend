import { Component, OnInit, ViewChild } from '@angular/core';
import { HTTPMainServiceService } from '../services/httpmain-service.service';
import {
  TicketListingDTO,
  TicketCategoryEnum,
  SevirityEnum,
} from '../DTOs/ticketListingDTO';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FiltermodalComponent } from '../filtermodal/filtermodal.component';

@Component({
  selector: 'app-all-table-component',
  templateUrl: './all-table-component.component.html',
  styleUrls: ['./all-table-component.component.css'],
})
export class AllTableComponentComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  pageSize: any = 10;
  pageIndex: any = 0;
  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    // this.pageSize = this.paginator._pageSize;
    // this.pageIndex = this.paginator._pageIndex;

    this.dataSource.sort = this.sort;
  }

  displayedColumns: string[] = [
    'select',
    'name',
    'createdDate',
    'ticketCategory',
    'Sevirity',
    'Actions',
  ];
  //check boxes part
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<TicketListingDTO>(
    this.allowMultiSelect,
    this.initialSelection
  );

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.UserViewInfoObject.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.UserViewInfoObject.forEach((row) => this.selection.select(row));
  }

  constructor(private http: HTTPMainServiceService, public dialog: MatDialog) {}

  UserViewInfoObject: TicketListingDTO[] = new Array<TicketListingDTO>();
  public TicketCategory = TicketCategoryEnum;
  public sevirity = SevirityEnum;

  dataSource: any;
  ngOnInit(): void {
    this.http
      .POST('ticket/list', {
        searchText: '',
        pageSize: 10,
        pageNumber: 0,
        isPrint: false,
        filter: {},
        sort: 0,
      })
      .subscribe((res) => {
        console.log(res.pageData);
        let usersData = res.pageData;
        this.UserViewInfoObject = usersData.map((el) => {
          let creationDate = new Date();
          return {
            initials: this.initials(el['rasiedBy']['name']),
            name: el['rasiedBy']['name'],
            email: el['rasiedBy']['email'],
            createdDate: creationDate.toDateString(),
            createdTime: creationDate.toLocaleTimeString(),
            ticketTopic: el.ticketTopic,
            ticketCategory: el.ticketType,
            Sevirity: el.severity,
          };
        });
        this.dataSource = new MatTableDataSource(this.UserViewInfoObject);
        this.setDataSourceAttributes();
      });
  }
  initials(name) {
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');

    let initials = [...name.matchAll(rgx)] || [];

    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();
    return initials;
  }

  openFilterModal() {
    const dialogRef = this.dialog.open(FiltermodalComponent, {
      position: { top: '23%', left: '18.5%' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
