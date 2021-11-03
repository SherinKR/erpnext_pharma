from __future__ import unicode_literals
from frappe import _

def get_data():
	return {
		'heatmap': False,
		'heatmap_message': _('This is based on transactions against this Franchise Payment Request'),
		'fieldname': 'franchise_payment_entry',
		'transactions': [
            {
                'label': _('Payments'),
                'items': ['Payment Entry']
            }
		]
	}