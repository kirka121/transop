import { Component, OnInit, Input } from '@angular/core';
import { User, Community } from '../../services/types';
import { CommunityService } from '../../services/community.service';

@Component({
  selector: 'app-my-community',
  templateUrl: './my-community.component.html',
  styleUrls: ['./my-community.component.scss']
})

export class MyCommunityComponent implements OnInit {
  @Input() user: User;
  community: Community;

  constructor(private commService: CommunityService) { }

  ngOnInit(): void {
    this.commService.initGetMyCommunity(this.user.id);

    this.commService.myCommunity.subscribe(myCommunity => {
      this.community = myCommunity
    });
  }

}
