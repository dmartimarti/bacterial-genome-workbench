/**
 * Authentic GFA (Graphical Fragment Assembly) format mock data
 * Illustrates how assemblers represent segments (S) and links (L)
 */

export const MOCK_GFA_K3 = `H\tVN:Z:1.0
S\ts1\tATG\tLN:i:3\tDP:f:30.0
S\ts2\tGCTA\tLN:i:4\tDP:f:60.0
S\ts3\tCC\tLN:i:2\tDP:f:30.0
S\ts4\tTTA\tLN:i:3\tDP:f:30.0
L\ts1\t+\ts2\t+\t2M
L\ts2\t+\ts3\t+\t2M
L\ts3\t+\ts2\t+\t2M
L\ts2\t+\ts4\t+\t2M`;

export const MOCK_GFA_K5 = `H\tVN:Z:1.0
S\ts1\tATGGCTA\tLN:i:7\tDP:f:30.0
S\ts2\tCTACC\tLN:i:5\tDP:f:30.0
S\ts3\tCCGCTATTA\tLN:i:9\tDP:f:30.0
L\ts1\t+\ts2\t+\t4M
L\ts2\t+\ts3\t+\t4M`;

export const MOCK_GFA_ERROR = `H\tVN:Z:1.0
S\ts1\tATGGCTA\tLN:i:7\tDP:f:30.0
S\ts2_true\tCTACC\tLN:i:5\tDP:f:30.0
S\ts2_bubble\tCTGCC\tLN:i:5\tDP:f:1.0
S\ts2_tip\tCTACG\tLN:i:5\tDP:f:1.0
S\ts3\tCCGCTATTA\tLN:i:9\tDP:f:30.0
L\ts1\t+\ts2_true\t+\t4M
L\ts1\t+\ts2_bubble\t+\t4M
L\ts1\t+\ts2_tip\t+\t4M
L\ts2_true\t+\ts3\t+\t4M
L\ts2_bubble\t+\ts3\t+\t4M`;
