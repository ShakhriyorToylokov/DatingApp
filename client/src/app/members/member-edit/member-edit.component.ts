import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MembersService } from './../../_services/members.service';
import { AccountService } from './../../_services/account.service';
import { User } from './../../_models/user';
import { Member } from './../../_models/member';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {

  @ViewChild('editForm') editForm:NgForm;
  @HostListener('window:beforeunload',['$event']) unloadNotification($event:any){
    if(this.editForm.dirty){
      $event.returnValue=true;
    }
  }
  member: Member;
  user: User
  constructor(private accountService: AccountService, private memberService: MembersService,
      private toastr:ToastrService) {
        this.accountService.currentUser$.pipe(take(1)).subscribe(user=>{
        this.user=user
        });
   }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(){
    this.memberService.getMember(this.user.username).subscribe(member=>{
      this.member=member
      console.log(member);
    });
  }

  updateMember(){
    this.memberService.updateMember(this.member).subscribe(()=>{

      this.toastr.success("Updated successfully"); 
      this.editForm.reset(this.member);
    })   
  }
}
