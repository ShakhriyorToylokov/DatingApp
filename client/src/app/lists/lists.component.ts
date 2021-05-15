import { LikeParams } from './../_models/likeParams';
import { Pagination } from './../_models/pagination';
import { MembersService } from 'src/app/_services/members.service';
import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/member';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  members: Partial<Member[]>;
  
  pagination:Pagination;
  likeParams:LikeParams;
  constructor(private memberService:MembersService) {
    this.likeParams=this.memberService.getLikeParams();
   }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes(){
    this.memberService.setLikeParams(this.likeParams);
    this.memberService.getLikes(this.likeParams).subscribe(response=>{
      this.members=response.result;
      this.pagination=response.pagination;
      console.log();
      
    });
  }

  pageChanged(event:any){
    this.likeParams.pageNumber=event.page;
    this.memberService.setLikeParams(this.likeParams);
    this.loadLikes();
  }
}
