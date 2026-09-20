import { Component, Input } from '@angular/core';
import { PolicyPage } from './policies';

@Component({
  selector: 'app-policy-page',
  templateUrl: './policy-page.component.html',
  styleUrl: './policy-page.component.css',
})
export class PolicyPageComponent {
  @Input({ required: true }) policy!: PolicyPage;
  @Input({ required: true }) contactEmail = '';
  @Input({ required: true }) contactPhone = '';
  @Input({ required: true }) contactPhoneHref = '';
  @Input({ required: true }) contactEmailHref = '';
}
