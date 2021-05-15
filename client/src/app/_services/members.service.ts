import { LikeParams } from './../_models/likeParams';
import { AccountService } from './account.service';
import { UserParams } from './../_models/userParams';
import { PaginatedResult } from './../_models/pagination';
import { map, take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeader } from './paginationHelper';


@Injectable({
  providedIn: 'root'
})
export class MembersService {

  members: Member[]=[];
  memberCache=new Map();
  baseUrl=environment.apiUrl;
  userParams:UserParams;
  user:User;
  likeParams:LikeParams;
  paginatedResult: PaginatedResult<Member[]>=new PaginatedResult<Member[]>();
  constructor(private http: HttpClient,private accountService:AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user=>{
      this.user=user;
      this.userParams=new UserParams(user);
      this.likeParams=new LikeParams();
    })
   }

   getUserParams(){
     return this.userParams;
   }

   setUserParams(params:UserParams){
     this.userParams=params;
   }

   resetUserParams(){
     this.userParams=new UserParams(this.user);
     return this.userParams;
   }
   getLikeParams(){
     return this.likeParams;
   }
  setLikeParams(params:LikeParams){
    this.likeParams=params;
  }   
  addLike(username:string){
    return this.http.post(this.baseUrl+'likes/'+ username,{});
  }

  getLikes(likeParams:LikeParams){
    let params=getPaginationHeader(likeParams.pageNumber,likeParams.pageSize);
    params=params.append('predicate',likeParams.predicate);
    return getPaginatedResult<Partial<Member[]>>(this.baseUrl+'likes',params,this.http);
  } 
  getMembers(userParams:UserParams){
    var response=this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
       return of(response);
    }

    let params=getPaginationHeader(userParams.pageNumber,userParams.pageSize);
    params=params.append('minAge',userParams.minAge.toString());
    params=params.append('maxAge',userParams.maxAge.toString());
    params=params.append('gender',userParams.gender);
    params=params.append('orderBy',userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl+'users', params,this.http)
    .pipe(map(response=>{
      this.memberCache.set(Object.values(userParams).join('-'),response);
      return response;
    }));
  }

 
  getMember(username:string){
    const member=[...this.memberCache.values()]
    .reduce((arr,elem)=>arr.concat(elem.result),[])
    .find((member:Member)=>member.username===username);//for not duplicating if there is a member no need to add again
    if (member) {
      return of(member);
    }
    
    return this.http.get<Member>(this.baseUrl+'users/'+username);
  }

  updateMember(member:Member){
    return this.http.put(this.baseUrl+'users',member).pipe(
      map(()=>{
        const index=this.members.indexOf(member);
        this.members[index]=member;
      })
    );
  }

  
  setMainPhoto(photoId: number){
      return this.http.put(this.baseUrl+'users/set-main-photo/'+ photoId,{});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl+'users/delete-photo/'+photoId);
  }

  
}
