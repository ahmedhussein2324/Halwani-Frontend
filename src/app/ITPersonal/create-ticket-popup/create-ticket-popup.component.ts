import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {SignalRService} from "../../services/signal-rservice.service"
import { createTicketDTO } from '../../core/DTOs/createTicketDTO';
import { getTicketDTO } from '../../core/DTOs/getTicketDTO';
import {
  PriorityEnum,
  SevirityEnum,
  SourceEnum,
} from '../../core/DTOs/ticketListingDTO';
import { HTTPMainServiceService } from '../../core/services/httpmain-service.service';
import { TicketCreationService } from '../../core/services/ticket-creation.service';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SharingdataService } from 'src/app/core/services/sharingdata.service';
import { TicketListingDTO } from 'src/app/core/DTOs/ticketListingDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { TabscreationService } from 'src/app/core/services/tabscreation.service';
@Component({
  selector: 'app-create-ticket-popup',
  templateUrl: './create-ticket-popup.component.html',
  styleUrls: ['./create-ticket-popup.component.css'],
})
export class CreateTicketPopupComponent implements OnInit {
  createTicketDTO: createTicketDTO = new createTicketDTO();
  updateTicketDto: createTicketDTO = new createTicketDTO();
  getTicketDTO: getTicketDTO = new getTicketDTO();
  createTicketDTOFormGroup: FormGroup;
  updateTicketDTOFormGroup: FormGroup;

  formData: FormData = new FormData();
  updateFormData: FormData = new FormData();
  fromPage: any;
  updateStatus: any;
  createTabsStatus: any;
  constructor(
    private formBuilder: FormBuilder,
    private signalRService: SignalRService,
    private http: HTTPMainServiceService,
    public dialog: MatDialog,
    public service: TicketCreationService,
    private share: SharingdataService,
    private tabs: TabscreationService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateTicketPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fromPage = data ? data.pageValue : undefined;
    this.updateStatus = tabs.getTabValue();
    this.createTabsStatus = tabs.getTabValue();
    this.signalRService.startConnection();
    this.signalRService.changeNotificationCount(this, this.updateNotification);
  }
  updateNotification(){
    
  }
  private FileLinks = [];
  showSecondCategory: boolean = false;
  saveAndOpenAnother: boolean = false;
  @Input() ticketTypeDatasource;
  @Input() reporterDatasource;
  @Input() locationDatasource;
  @Input() sourceDatasource;
  @Input() seviritysource;
  @Input() teamSoruce;
  @Input() productCategoryName1;
  @Input() productCategoryName2;

  ticketID: any;
  durationInSeconds: any = 3;

  //update-controls-values
  ticketType: any;
  summary: any;
  attachement: any = [];
  description: any;
  team: any;
  location: any;
  reporter = new FormControl();
  source: any;
  sevirity: any;
  priority: any;
  categoryName1: any;
  categoryName2: any;
  ticketList: TicketListingDTO = new TicketListingDTO();

  filePath: any;
  fileName: any = [];

  locations = new FormControl();
  locationList: any = [];
  sources = new FormControl();
  sourceList: any = [];
  severities = new FormControl();
  severityList: any = [];
  priorities = new FormControl();
  priorityList: any = [];

  reporterNewValue: any;
  reporterFlag: boolean = false;
  reporterChanged(e: any) {
    this.reporterFlag = true;
    this.reporterNewValue = e.split(',')[1];
  }
  ngOnInit(): void {
    //update
    this.ticketID = this.share.getData();
    console.log('ticketId', this.ticketID);
    if (this.ticketID !== undefined) {
      this.http
        .POST('ticket/getTicket', { id: this.ticketID.toString() })
        .subscribe((res) => {
          console.log('resoooo', res);
          this.http.GET('RequestType/getRequestType').subscribe((data) => {
            console.log('jdiuehfheuhf', this.updateStatus);
            if (this.updateStatus === undefined) {
              this.ticketTypeDatasource = data;
            } else {
              console.log('else');
              console.log('eeeeee', data);

              this.ticketTypeDatasource = data
                .filter((el1) => el1.ticketType === this.updateStatus)
                .map((el) => {
                  console.log(el);
                  return { ticketType: el.ticketType, topics: el.topics };
                });
            }
          });
          this.ticketType = res.requestType.id;
          this.summary = res.ticketName;
          this.FileLinks = res.attachement;
          console.log('ttt', this.FileLinks);
          this.description = res.description;
          this.team = res.teamName;
          this.location = res.location;
          this.reporter = res.submitterEmail;
          this.source = res.source;
          this.sevirity = res.ticketSeverity;
          this.priority = res.priority;
          this.categoryName1 = res.productCategoryName1;
          this.categoryName2 = res.productCategoryName2;
        });
      this.updateTicketDTOFormGroup = this.formBuilder.group({
        ticketType: [this.ticketType],
        summary: [this.summary],
        description: [this.description],
        team: [this.team],
        location: [this.location],
        reporter: [this.reporter],
        source: [this.source],
        sevirity: [this.sevirity],
        priority: [this.priority],
        categoryName1: [this.categoryName1],
        categoryName2: [this.categoryName2],
      });
      this.share.setData(undefined);
    }

    //create
    this.createTicketDTOFormGroup = this.formBuilder.group({
      ticketType: ['', [Validators.required]],
      summary: ['', [Validators.required]],
      description: [''],
      team: ['', [Validators.required]],
      location: ['', [Validators.required]],
      reporter: [0, [Validators.required]],
      source: [0, [Validators.required]],
      sevirity: [0, [Validators.required]],
      priority: [0, [Validators.required]],
      productCategoryName1: [0, [Validators.required]],
      productCategoryName2: [0, [Validators.required]],
      saveAndOpenAnother: [false],
    });
    const sevKeys = Object.keys(SevirityEnum).filter(
      (k) => typeof SevirityEnum[k as any] === 'string'
    );
    sevKeys.map((k) => this.severityList.push(SevirityEnum[k as any]));

    console.log('seeeeeeev', this.severityList);
    const priKeys = Object.keys(PriorityEnum).filter(
      (k) => typeof PriorityEnum[k as any] === 'string'
    );
    priKeys.map((k) => this.priorityList.push(PriorityEnum[k as any]));

    const souKeys = Object.keys(SourceEnum).filter(
      (k) => typeof SourceEnum[k as any] === 'string'
    );
    souKeys.map((k) => this.sourceList.push(SourceEnum[k as any]));

    this.http.GET('api/Location/getLocations').subscribe((data) => {
      console.log('locations', data);
      data.map((location) => {
        this.locationList.push({
          label: location['text'],
          value: location['id'],
        });
      });
    });

    this.http.GET('RequestType/getRequestType').subscribe((data) => {
      console.log(this.fromPage);
      if (this.fromPage === undefined && this.createTabsStatus === undefined) {
        this.ticketTypeDatasource = data;
      } else {
        console.log('else');
        console.log(data);
        this.ticketTypeDatasource = data
          .filter((el1) =>
            this.createTabsStatus === undefined
              ? el1.ticketType === this.fromPage
              : el1.ticketType === this.createTabsStatus
          )
          .map((el) => {
            console.log(el);
            return { ticketType: el.ticketType, topics: el.topics };
          });
      }
    });
    this.http.GET('User/getUser').subscribe((data) => {
      this.reporterDatasource = data.map((el) => {
        return {
          label: el.text,
          value: `${el.team},${el.email},${el.userName}`,
          initials: this.initials(el.text),
          label1: el.email,
        };
      });
    });

    this.http.GET('Team/get').subscribe((data) => {
      this.teamSoruce = data.map((el) => {
        return { label: el.text, value: el.text };
      });
    }),
      this.http.GET('Category/getCategory').subscribe((data) => {
        this.productCategoryName1 = data.map((el) => {
          return { label: el.text, value: el.id };
        });
      });
  }
  productCategoryOne(event) {
    this.http.GET('Category/getCategory').subscribe((data) => {
      this.productCategoryName2 = data
        .find((el) => {
          return el.text === event.value;
        })
        .children.map((el) => {
          return { label: el.text, value: el.id };
        });
    });

    this.showSecondCategory = true;
  }
  submiCreate() {
    console.log('creaaation', this.createTicketDTOFormGroup.value);
    this.createTicketDTO.attachement =
      this.FileLinks !== undefined ? this.FileLinks.toString() : '';
    console.log('creaaate file', this.createTicketDTO.attachement);
    this.createTicketDTO.description =
      this.createTicketDTOFormGroup.value.description;
    this.createTicketDTO.productCategoryName1 =
      this.createTicketDTOFormGroup.value.productCategoryName1.toString();
    this.createTicketDTO.productCategoryName2 =
      this.createTicketDTOFormGroup.value.productCategoryName2.toString();
    let submitterArray =
      this.createTicketDTOFormGroup.value.reporter.split(',');
    this.createTicketDTO.submitterTeam = submitterArray[0];
    this.createTicketDTO.submitterEmail = submitterArray[1];
    this.createTicketDTO.submitterName = submitterArray[2];
    this.createTicketDTO.location =
      this.createTicketDTOFormGroup.value.location;
    this.createTicketDTO.summary = this.createTicketDTOFormGroup.value.summary;
    this.createTicketDTO.submitDate = new Date();
    this.createTicketDTO.requestTypeId = Number(
      this.createTicketDTOFormGroup.value.ticketType
    );
    this.createTicketDTO.ticketSeverity =
      this.createTicketDTOFormGroup.value.sevirity;
    this.createTicketDTO.ticketStatus = 0;
    //will be from aad
    this.createTicketDTO.reportedSource = 'admin';
    this.createTicketDTO.teamName = this.createTicketDTOFormGroup.value.team;
    this.createTicketDTO.priority =
      this.createTicketDTOFormGroup.value.priority;
    this.createTicketDTO.source = this.createTicketDTOFormGroup.value.source;
    var requestData = JSON.stringify(this.createTicketDTO);
    this.formData.append('data', requestData);
    console.log('createDto', requestData);

    this.http.POST('Ticket/CreateTicket', this.formData).subscribe(
      (data) => {
        console.log('create tickeet');
        this._snackBar.openFromComponent(ToastMessageComponent, {
          duration: this.durationInSeconds * 1000,
        });
        this.service.setValue(true);
      },
      (error) => {
        console.log(error);
      },
      () => {
        this.dialogRef.afterClosed().subscribe((result) => {
          console.log(`Dialog result: ${result}`);
        });
      }
    );
    if (this.createTicketDTOFormGroup.value.saveAndOpenAnother) {
      const dialogRef = this.dialog.open(CreateTicketPopupComponent, {
        data: { pageValue: this.fromPage },
      });
    }
  }

  submitUpdate() {
    console.log(
      'a7mos',
      this.updateTicketDTOFormGroup.value,
      'ffffff',
      this.FileLinks
    );

    let submitterArray =
      this.updateTicketDTOFormGroup.value.reporter.split(',');
    console.log('array', submitterArray);
    this.updateTicketDto.attachement =
      this.FileLinks !== undefined ? this.FileLinks.toString() : '';
    console.log('eeee', this.updateTicketDto.attachement);
    this.updateTicketDto.id = this.ticketID;
    this.updateTicketDto.description =
      this.updateTicketDTOFormGroup.value.description;
    this.updateTicketDto.productCategoryName1 =
      this.updateTicketDTOFormGroup.value.categoryName1.toString();
    this.updateTicketDto.productCategoryName2 =
      this.updateTicketDTOFormGroup.value.categoryName2.toString();
    this.updateTicketDto.submitterTeam = submitterArray[0];
    this.updateTicketDto.submitterEmail = submitterArray[0];
    this.updateTicketDto.submitterName = submitterArray[0];
    this.updateTicketDto.location =
      this.updateTicketDTOFormGroup.value.location;
    this.updateTicketDto.summary = this.updateTicketDTOFormGroup.value.summary;
    this.updateTicketDto.submitDate = new Date();
    this.updateTicketDto.requestTypeId = Number(
      this.updateTicketDTOFormGroup.value.ticketType
    );
    this.updateTicketDto.ticketSeverity =
      this.updateTicketDTOFormGroup.value.sevirity;
    this.updateTicketDto.ticketStatus = 0;
    //will be from aad
    this.updateTicketDto.reportedSource = 'admin';
    this.updateTicketDto.teamName = this.updateTicketDTOFormGroup.value.team;
    this.updateTicketDto.priority =
      this.updateTicketDTOFormGroup.value.priority;
    this.updateTicketDto.source = this.updateTicketDTOFormGroup.value.source;

    var updated = JSON.stringify(this.updateTicketDto);
    this.updateFormData.append('data', updated);
    this.http.PUT('Ticket/UpdateTic/', this.updateFormData).subscribe((res) => {
      this._snackBar.openFromComponent(ToastMessageComponent, {
        duration: this.durationInSeconds * 1000,
      });
      this.service.setValue(true);
    });
  }

  private deleteImage(url: any): void {
    this.FileLinks = this.FileLinks.filter((a) => a !== url);
    this.formData.delete(url);
    this.updateFormData.delete(url);
    console.log('formdata', this.formData);
    console.log('after deleted', this.FileLinks);
  }
  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[], value: any) {
    console.log('valueee', value, files);
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          console.log('eeee', file);
          if (value === 0) {
            this.formData.append(file.name, file);
            console.log('insert', this.formData);
            this.FileLinks.push(file.name);
            console.log('fillllll', this.FileLinks);
          } else {
            this.updateFormData.append(file.name, file);
            this.FileLinks.push(file.name);
          }
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log('files uploaded', files);
  }

  public fileOver(event) {
    alert('ovvver');
    console.log(event);
  }

  public fileLeave(event) {
    alert('leaaave');
    console.log(event);
  }
  initials(name) {
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');

    let initials = [...name.matchAll(rgx)] || [];

    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();
    return initials;
  }
}
