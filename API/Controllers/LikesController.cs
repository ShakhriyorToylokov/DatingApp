using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helper;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class LikesController : BaseApiController
    {
        private readonly ILikesRepository _likesRepository;
        private readonly IUserRepository _userRepository;
        public LikesController(IUserRepository userRepository, ILikesRepository likesRepository)
        {
            _userRepository = userRepository;
            _likesRepository = likesRepository;
        }

        [HttpPost("{username}")]

        public async Task<ActionResult> AddLikes(string username){
            var sourceUserId= User.GetUserId();
            var likedUser= await _userRepository.GetUserByUsernameAsync(username);
            var sourceUser= await _likesRepository.GetUserWithLikes(sourceUserId);

            if (likedUser==null) return NotFound();

            var userLike= await _likesRepository.GetUserLike(sourceUserId,likedUser.Id);

            if (userLike!=null)    return BadRequest("You already liked this user!");
            
            userLike=new UserLike   
            {
                SourceUserId=sourceUserId,
                LikedUserId=likedUser.Id
            };
            sourceUser.LikedUsers.Add(userLike);
            
            if (await _userRepository.SaveAllAsync()) return Ok();
            
            return BadRequest("Failed to like a user!");

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery]LikesParams likesParams){
            likesParams.UserId=User.GetUserId();
            var user = await _likesRepository.GetUserLikes(likesParams);
            Response.AddPaginationHeader(user.CurrentPage,user.PageSize,user.TotalCount,user.TotalPages);
            return Ok(user);
        }
    }
}